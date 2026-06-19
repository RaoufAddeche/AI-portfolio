"""Administration (curation) — protégée par ADMIN_TOKEN (en-tête X-Admin-Token).

Permet de valider les projets, corriger les catégories, modérer les avis et
relire les messages de contact, sans toucher à la base manuellement.
"""
from urllib.parse import urlparse

import asyncpg
from fastapi import APIRouter, Depends, Header, HTTPException, Query

from ..config import get_settings
from ..db import get_db
from ..services.llm import CATEGORIES

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(x_admin_token: str | None = Header(None)) -> None:
    """Vérifie le token d'admin (403 sinon, 503 si non configuré)."""
    token = get_settings().admin_token
    if not token:
        raise HTTPException(status_code=503, detail="Admin non configuré (ADMIN_TOKEN)")
    if x_admin_token != token:
        raise HTTPException(status_code=401, detail="Token admin invalide")


@router.get("/check", dependencies=[Depends(require_admin)])
async def check():
    """Validation du token (utilisé par la page de login admin)."""
    return {"ok": True, "categories": CATEGORIES}


# ---------- Projets ----------
@router.get("/portfolio", dependencies=[Depends(require_admin)])
async def admin_list_portfolio(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch(
        "SELECT id, repo, title, short_pitch, category, status, "
        "human_reviewed, github_url, github_language, github_stars "
        "FROM portfolio_items ORDER BY ai_confidence_score DESC, repo"
    )
    return [dict(r) for r in rows]


@router.patch("/portfolio/{item_id}", dependencies=[Depends(require_admin)])
async def admin_update_portfolio(
    item_id: int, updates: dict, conn: asyncpg.Connection = Depends(get_db)
):
    """Met à jour statut / catégorie / featured d'un projet et le verrouille (human_reviewed)."""
    allowed = {"status", "category"}
    sets, params, i = [], [], 0
    for key, value in updates.items():
        if key not in allowed:
            continue
        if key == "status" and value not in ("draft", "approved", "published", "archived"):
            raise HTTPException(status_code=400, detail="Statut invalide")
        if key == "category" and value not in CATEGORIES:
            raise HTTPException(status_code=400, detail="Catégorie invalide")
        i += 1
        sets.append(f"{key} = ${i}")
        params.append(value)
    if not sets:
        raise HTTPException(status_code=400, detail="Aucun champ valide")
    i += 1
    params.append(item_id)
    await conn.execute(
        f"UPDATE portfolio_items SET {', '.join(sets)}, human_reviewed = TRUE, "
        f"updated_at = NOW() WHERE id = ${i}",
        *params,
    )
    return {"success": True}


# ---------- Avis ----------
@router.get("/testimonials", dependencies=[Depends(require_admin)])
async def admin_list_testimonials(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch(
        "SELECT id, author_name, author_title, author_company, author_linkedin_url, "
        "quote, is_published, created_at FROM testimonials ORDER BY created_at DESC"
    )
    return [dict(r) for r in rows]


@router.patch("/testimonials/{item_id}", dependencies=[Depends(require_admin)])
async def admin_update_testimonial(
    item_id: int, updates: dict, conn: asyncpg.Connection = Depends(get_db)
):
    published = bool(updates.get("is_published", True))
    await conn.execute(
        "UPDATE testimonials SET is_published = $1, is_featured = $1, updated_at = NOW() "
        "WHERE id = $2",
        published,
        item_id,
    )
    return {"success": True}


@router.delete("/testimonials/{item_id}", dependencies=[Depends(require_admin)])
async def admin_delete_testimonial(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    await conn.execute("DELETE FROM testimonials WHERE id = $1", item_id)
    return {"success": True}


# ---------- Messages de contact ----------
@router.get("/contacts", dependencies=[Depends(require_admin)])
async def admin_list_contacts(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch(
        "SELECT id, name, email, company, subject, message, status, created_at "
        "FROM contact_submissions ORDER BY created_at DESC LIMIT 200"
    )
    return [dict(r) for r in rows]


@router.delete("/contacts/{item_id}", dependencies=[Depends(require_admin)])
async def admin_delete_contact(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    await conn.execute("DELETE FROM contact_submissions WHERE id = $1", item_id)
    return {"success": True}


# ---------- Analytics ----------
def _host(url: str | None) -> str:
    """Nom d'hôte lisible d'un referrer (sinon « accès direct »)."""
    if not url:
        return "Accès direct"
    try:
        netloc = urlparse(url).netloc or url
        return netloc[4:] if netloc.startswith("www.") else netloc
    except ValueError:
        return "Autre"


@router.get("/analytics", dependencies=[Depends(require_admin)])
async def admin_analytics(
    days: int = Query(30, ge=1, le=365), conn: asyncpg.Connection = Depends(get_db)
):
    """Tableau de bord analytics : trafic, engagement et conversions sur N jours."""
    since = "created_at >= CURRENT_DATE - make_interval(days => $1)"

    # Compteurs globaux en une passe (FILTER par type d'événement).
    totals = await conn.fetchrow(
        f"""
        SELECT
            COUNT(DISTINCT session_id)                                  AS sessions,
            COUNT(*) FILTER (WHERE event_type = 'page_view')            AS page_views,
            COUNT(*) FILTER (WHERE event_type = 'cv_download')          AS cv_downloads,
            COUNT(*) FILTER (WHERE event_type = 'contact')              AS contacts,
            COUNT(*) FILTER (WHERE event_type = 'project_click')        AS project_clicks,
            COUNT(*) FILTER (WHERE event_type = 'chat_open')            AS chat_opens,
            COUNT(*) FILTER (WHERE event_type = 'chat_message')         AS chat_messages,
            AVG(event_value) FILTER (WHERE event_type = 'time_on_page') AS avg_time_seconds
        FROM analytics_events
        WHERE {since}
        """,
        days,
    )

    # Scroll moyen = moyenne, par session, du palier de scroll le plus profond atteint.
    avg_scroll = await conn.fetchval(
        f"""
        SELECT AVG(max_pct) FROM (
            SELECT session_id, MAX(event_value) AS max_pct
            FROM analytics_events
            WHERE event_type = 'scroll_depth' AND {since}
            GROUP BY session_id
        ) s
        """,
        days,
    )

    top_projects = await conn.fetch(
        f"""
        SELECT event_label AS label, COUNT(*) AS clicks
        FROM analytics_events
        WHERE event_type = 'project_click' AND event_label IS NOT NULL AND {since}
        GROUP BY event_label ORDER BY clicks DESC LIMIT 8
        """,
        days,
    )

    referrers = await conn.fetch(
        f"""
        SELECT referrer_url, COUNT(*) AS count
        FROM analytics_events
        WHERE event_type = 'page_view' AND {since}
        GROUP BY referrer_url ORDER BY count DESC LIMIT 20
        """,
        days,
    )
    # Regroupe par hôte côté Python (URLs complètes -> domaines lisibles).
    by_host: dict[str, int] = {}
    for r in referrers:
        by_host[_host(r["referrer_url"])] = by_host.get(_host(r["referrer_url"]), 0) + r["count"]
    top_referrers = sorted(
        ({"referrer": k, "count": v} for k, v in by_host.items()),
        key=lambda x: x["count"],
        reverse=True,
    )[:8]

    daily = await conn.fetch(
        f"""
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS views
        FROM analytics_events
        WHERE event_type = 'page_view' AND {since}
        GROUP BY day ORDER BY day
        """,
        days,
    )

    return {
        "days": days,
        "sessions": totals["sessions"] or 0,
        "page_views": totals["page_views"] or 0,
        "cv_downloads": totals["cv_downloads"] or 0,
        "contacts": totals["contacts"] or 0,
        "project_clicks": totals["project_clicks"] or 0,
        "chat_opens": totals["chat_opens"] or 0,
        "chat_messages": totals["chat_messages"] or 0,
        "avg_time_seconds": round(totals["avg_time_seconds"] or 0),
        "avg_scroll_pct": round(avg_scroll or 0),
        "top_projects": [{"label": r["label"], "clicks": r["clicks"]} for r in top_projects],
        "top_referrers": top_referrers,
        "daily": [{"day": r["day"].isoformat(), "views": r["views"]} for r in daily],
    }
