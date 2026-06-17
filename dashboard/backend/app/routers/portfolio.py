"""Items de portfolio auto-générés, stats et journal d'événements."""
import json

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_db
from ..models import PortfolioEvent, PortfolioItem, PortfolioStats

router = APIRouter(tags=["portfolio"])


def _normalize_item(row) -> dict:
    item = dict(row)
    item["tags"] = list(item["tags"]) if item["tags"] else []
    item["stack"] = list(item["stack"]) if item["stack"] else []
    item["achievements"] = item["achievements"] if item["achievements"] else []
    item["business_metrics"] = item["business_metrics"] if item["business_metrics"] else {}
    item["technical_metrics"] = item["technical_metrics"] if item["technical_metrics"] else {}
    return item


@router.get("/api/portfolio", response_model=list[PortfolioItem])
async def get_portfolio_items(
    status: str | None = Query(None, description="Filter by status"),
    language: str | None = Query(None, description="Filter by language"),
    min_confidence: float | None = Query(None, description="Minimum confidence score"),
    limit: int = Query(50, description="Limit results"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les items du portfolio avec filtres optionnels."""
    query = """
        SELECT id, repo, title, short_pitch, long_desc, tags, stack, impact,
               github_url, github_stars, github_forks, github_language,
               last_commit_date, ai_confidence_score, status, created_at,
               updated_at, human_reviewed, business_metrics, technical_metrics,
               achievements, complexity_score, team_size, project_duration_months,
               demo_url, live_url, category
        FROM portfolio_items
        WHERE 1=1
    """
    params = []
    param_count = 0

    if status:
        param_count += 1
        query += f" AND status = ${param_count}"
        params.append(status)

    if language:
        param_count += 1
        query += f" AND github_language = ${param_count}"
        params.append(language)

    if min_confidence:
        param_count += 1
        query += f" AND ai_confidence_score >= ${param_count}"
        params.append(min_confidence)

    query += " ORDER BY created_at DESC"

    if limit:
        param_count += 1
        query += f" LIMIT ${param_count}"
        params.append(limit)

    rows = await conn.fetch(query, *params)
    return [PortfolioItem(**_normalize_item(row)) for row in rows]


@router.get("/api/portfolio/{item_id}", response_model=PortfolioItem)
async def get_portfolio_item(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    """Récupérer un item spécifique du portfolio."""
    row = await conn.fetchrow("SELECT * FROM portfolio_items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return PortfolioItem(**_normalize_item(row))


@router.get("/api/stats", response_model=PortfolioStats)
async def get_portfolio_stats(conn: asyncpg.Connection = Depends(get_db)):
    """Statistiques du portfolio."""
    stats_row = await conn.fetchrow("""
        SELECT
            COUNT(*) as total_projects,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_projects,
            COUNT(*) FILTER (WHERE status = 'draft') as draft_projects,
            COALESCE(AVG(ai_confidence_score), 0) as avg_confidence,
            COALESCE(SUM(github_stars), 0) as total_stars
        FROM portfolio_items
    """)

    languages = await conn.fetch("""
        SELECT github_language as language, COUNT(*) as count
        FROM portfolio_items
        WHERE github_language IS NOT NULL
        GROUP BY github_language
        ORDER BY count DESC
        LIMIT 10
    """)

    return PortfolioStats(
        total_projects=stats_row["total_projects"],
        approved_projects=stats_row["approved_projects"],
        draft_projects=stats_row["draft_projects"],
        avg_confidence=round(float(stats_row["avg_confidence"]), 2),
        total_stars=stats_row["total_stars"],
        top_languages=[{"language": r["language"], "count": r["count"]} for r in languages],
    )


@router.get("/api/events", response_model=list[PortfolioEvent])
async def get_portfolio_events(
    limit: int = Query(20, description="Limit results"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les événements du portfolio."""
    rows = await conn.fetch(
        """
        SELECT id, ts, source, repo, action, payload, status
        FROM portfolio_events
        ORDER BY ts DESC
        LIMIT $1
        """,
        limit,
    )

    events = []
    for row in rows:
        event = dict(row)
        if event["payload"]:
            try:
                event["payload"] = (
                    json.loads(event["payload"])
                    if isinstance(event["payload"], str)
                    else event["payload"]
                )
            except (json.JSONDecodeError, TypeError):
                event["payload"] = {}
        events.append(PortfolioEvent(**event))
    return events


@router.put("/api/portfolio/{item_id}/status")
async def update_portfolio_status(
    item_id: int, status: str, conn: asyncpg.Connection = Depends(get_db)
):
    """Mettre à jour le statut d'un item portfolio."""
    if status not in ["draft", "approved", "published", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = await conn.execute(
        """
        UPDATE portfolio_items
        SET status = $1, human_reviewed = true, updated_at = NOW()
        WHERE id = $2
        """,
        status,
        item_id,
    )

    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    await conn.execute(
        """
        INSERT INTO portfolio_events (source, repo, action, payload, status)
        SELECT 'manual', repo, 'status_updated', $1::jsonb, 'ok'
        FROM portfolio_items WHERE id = $2
        """,
        json.dumps({"new_status": status, "item_id": item_id}),
        item_id,
    )

    return {"message": "Status updated successfully"}
