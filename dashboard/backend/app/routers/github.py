"""Intégration GitHub : liste des repos, README, et synchro vers portfolio_items.

Remplace l'ancien sidecar Node + le workflow n8n de scan. La synchro est
déclenchée à la demande (endpoint POST, cron ou GitHub Action) — aucun service
LLM permanent.

Optimisations :
- détection de changement : on n'appelle le LLM que pour les repos modifiés
  depuis le dernier résumé (comparaison de `pushed_at` avec last_commit_date) ;
- catégorie déterministe via les topics GitHub, LLM en secours ;
- les items revus manuellement (human_reviewed) ne sont jamais réécrasés.
"""
from datetime import datetime

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from ..config import get_settings
from ..db import get_db
from ..services import github as gh
from ..services import llm

router = APIRouter(prefix="/api/github", tags=["github"])

# Topics GitHub -> catégorie (priorité du plus spécifique IA au plus générique).
_TOPIC_MAP = [
    (("llm", "genai", "generative-ai", "rag", "gpt", "openai", "prompt-engineering"),
     "IA Générative / LLM"),
    (("agent", "agentic", "agents", "mcp", "autonomous", "langgraph"), "IA Agentique"),
    (("data-science", "machine-learning", "ml", "datascience", "deep-learning",
      "scikit-learn", "pytorch", "kaggle"), "Data Science / ML"),
    (("data-engineering", "etl", "pipeline", "spark", "pyspark", "airflow", "dbt"),
     "Data Engineering"),
    (("web", "webapp", "react", "fastapi", "django", "api", "frontend", "website"),
     "Application / Web"),
]


def _category_from_topics(topics: list[str] | None) -> str | None:
    have = {t.lower() for t in (topics or [])}
    for keys, cat in _TOPIC_MAP:
        if have.intersection(keys):
            return cat
    return None


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


@router.get("/repos")
async def list_repos():
    """Lister les repos publics de l'utilisateur configuré."""
    try:
        repos = await gh.list_repos()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return [
        {
            "name": r["name"],
            "full_name": r["full_name"],
            "description": r.get("description"),
            "html_url": r["html_url"],
            "language": r.get("language"),
            "stargazers_count": r.get("stargazers_count", 0),
            "forks_count": r.get("forks_count", 0),
            "pushed_at": r.get("pushed_at"),
            "topics": r.get("topics", []),
            "fork": r.get("fork", False),
        }
        for r in repos
    ]


@router.get("/readme")
async def read_readme(
    owner: str = Query(..., description="Repo owner"),
    repo: str = Query(..., description="Repo name"),
):
    """Lire le README brut d'un repo."""
    try:
        return {"owner": owner, "repo": repo, "readme": await gh.get_readme(owner, repo)}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/sync")
async def sync_repos(
    min_stars: int = Query(0, description="Ne synchroniser que les repos avec >= N stars"),
    include_forks: bool = Query(False, description="Inclure les forks"),
    limit: int = Query(30, ge=1, le=100, description="Nombre max de repos à examiner"),
    force: bool = Query(False, description="Forcer le re-résumé même si inchangé"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Synchroniser les repos : ne résume (LLM) que ceux modifiés depuis la dernière fois.

    Les items créés sont en statut 'draft' (validation humaine avant publication).
    """
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=400, detail="OPENAI_API_KEY non configuré")

    try:
        repos = await gh.list_repos()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"GitHub: {exc}") from exc

    candidates = [
        r for r in repos
        if (include_forks or not r.get("fork"))
        and r.get("stargazers_count", 0) >= min_stars
    ][:limit]

    summarized, skipped, errors = [], [], []
    owner = settings.github_username

    for r in candidates:
        repo_name = r["full_name"]
        pushed = _parse_dt(r.get("pushed_at"))
        existing = await conn.fetchrow(
            "SELECT last_commit_date, human_reviewed FROM portfolio_items WHERE repo = $1",
            repo_name,
        )

        # Item curé manuellement : on n'y touche pas.
        if existing and existing["human_reviewed"]:
            skipped.append({"repo": repo_name, "reason": "revu manuellement"})
            continue

        # Inchangé depuis le dernier résumé : pas d'appel LLM.
        if (
            not force
            and existing
            and existing["last_commit_date"]
            and pushed
            and pushed <= existing["last_commit_date"]
        ):
            skipped.append({"repo": repo_name, "reason": "inchangé"})
            continue

        try:
            readme = await gh.get_readme(owner, r["name"])
            summary = await llm.summarize_repo(
                name=r["name"],
                description=r.get("description") or "",
                readme=readme,
                language=r.get("language"),
            )
            category = _category_from_topics(r.get("topics")) or summary.get("category", "Autre")
            await conn.execute(
                """
                INSERT INTO portfolio_items
                    (repo, title, short_pitch, long_desc, tags, stack,
                     github_url, github_stars, github_forks, github_language,
                     last_commit_date, ai_confidence_score, category, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'draft')
                ON CONFLICT (repo) DO UPDATE SET
                    title = EXCLUDED.title,
                    short_pitch = EXCLUDED.short_pitch,
                    long_desc = EXCLUDED.long_desc,
                    tags = EXCLUDED.tags,
                    stack = EXCLUDED.stack,
                    github_stars = EXCLUDED.github_stars,
                    github_forks = EXCLUDED.github_forks,
                    github_language = EXCLUDED.github_language,
                    last_commit_date = EXCLUDED.last_commit_date,
                    ai_confidence_score = EXCLUDED.ai_confidence_score,
                    category = EXCLUDED.category,
                    updated_at = NOW()
                WHERE portfolio_items.human_reviewed = FALSE
                """,
                repo_name,
                summary.get("title", r["name"]),
                summary.get("short_pitch", ""),
                summary.get("long_desc", ""),
                list(summary.get("tags", [])),
                list(summary.get("stack", [])),
                r["html_url"],
                r.get("stargazers_count", 0),
                r.get("forks_count", 0),
                r.get("language"),
                pushed,
                int(summary.get("ai_confidence_score", 50)),
                category,
            )
            await conn.execute(
                "INSERT INTO portfolio_events (source, repo, action, payload, status) "
                "VALUES ('github_sync', $1, 'summarized', $2::jsonb, 'ok')",
                repo_name,
                '{"via": "openai"}',
            )
            summarized.append(repo_name)
        except Exception as exc:  # noqa: BLE001
            errors.append({"repo": repo_name, "error": str(exc)})

    return {
        "summarized": summarized,
        "summarized_count": len(summarized),
        "skipped_count": len(skipped),
        "skipped": skipped,
        "errors": errors,
    }
