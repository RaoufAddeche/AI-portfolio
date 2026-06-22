"""Phase 3 : tracking analytics et tableaux de bord (sessions, événements)."""
import json

import asyncpg
from fastapi import APIRouter, Depends, Query, Request

from ..db import get_db
from ..models import AnalyticsEvent, VisitorSession

router = APIRouter(tags=["analytics"])

_COUNTER_FIELDS = {"page_views", "projects_viewed", "blog_posts_viewed", "mode_switches"}
_BOOL_FIELDS = {"contact_submitted", "cv_downloaded"}


def _client_ip(request: Request) -> str | None:
    """IP réelle du client derrière le reverse-proxy (en-têtes posés par nginx/Caddy)."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.headers.get("x-real-ip") or (request.client.host if request.client else None)


@router.post("/api/analytics/event")
async def track_analytics_event(
    event: AnalyticsEvent, request: Request, conn: asyncpg.Connection = Depends(get_db)
):
    """Enregistrer un événement analytics (IP captée côté serveur, pour filtrage admin)."""
    await conn.execute(
        """
        INSERT INTO analytics_events (
            session_id, event_type, event_category, event_label, event_value,
            portfolio_mode, page_url, referrer_url, target_type, target_id, metadata,
            ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """,
        event.session_id,
        event.event_type,
        event.event_category,
        event.event_label,
        event.event_value,
        event.portfolio_mode,
        event.page_url,
        event.referrer_url,
        event.target_type,
        event.target_id,
        json.dumps(event.metadata) if event.metadata else None,
        _client_ip(request),
    )
    return {"success": True, "message": "Event tracked"}


@router.post("/api/analytics/session")
async def create_or_update_session(
    session: VisitorSession, conn: asyncpg.Connection = Depends(get_db)
):
    """Créer une session visiteur."""
    result = await conn.fetchrow(
        """
        INSERT INTO visitor_sessions (
            landing_page, landing_mode, referrer_source,
            utm_source, utm_medium, utm_campaign,
            user_agent, device_type, browser, os, screen_resolution, ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
        """,
        session.landing_page,
        session.landing_mode,
        session.referrer_source,
        session.utm_source,
        session.utm_medium,
        session.utm_campaign,
        session.user_agent,
        session.device_type,
        session.browser,
        session.os,
        session.screen_resolution,
        session.ip_address,
    )
    return {"success": True, "session_id": str(result["id"])}


@router.patch("/api/analytics/session/{session_id}")
async def update_session_activity(
    session_id: str, updates: dict, conn: asyncpg.Connection = Depends(get_db)
):
    """Mettre à jour l'activité d'une session."""
    set_clauses, params, param_count = [], [], 1
    for key, value in updates.items():
        if key in _COUNTER_FIELDS:
            set_clauses.append(f"{key} = {key} + ${param_count}")
        elif key in _BOOL_FIELDS:
            set_clauses.append(f"{key} = ${param_count}")
        elif key == "modes_viewed":
            set_clauses.append(f"modes_viewed = array_append(modes_viewed, ${param_count})")
        else:
            continue
        params.append(value)
        param_count += 1

    if not set_clauses:
        return {"success": False, "message": "No valid updates provided"}

    set_clauses.append("last_seen_at = CURRENT_TIMESTAMP")
    params.append(session_id)
    query = (
        f"UPDATE visitor_sessions SET {', '.join(set_clauses)} WHERE id = ${param_count}"
    )
    await conn.execute(query, *params)
    return {"success": True, "message": "Session updated"}


@router.get("/api/analytics/summary")
async def get_analytics_summary(
    mode: str | None = None,
    days: int = Query(7, ge=1, le=90),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Résumé analytics des N derniers jours."""
    query = """
        SELECT
            COUNT(DISTINCT session_id) as total_sessions,
            COUNT(*) as total_events,
            COUNT(DISTINCT CASE WHEN event_type = 'contact' THEN session_id END) as contacts,
            COUNT(DISTINCT CASE WHEN event_type = 'cv_download' THEN session_id END) as cv_downloads,
            AVG(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as avg_page_views
        FROM analytics_events
        WHERE created_at >= CURRENT_DATE - make_interval(days => $1)
    """
    if mode:
        query += " AND portfolio_mode = $2"
        result = await conn.fetchrow(query, days, mode)
    else:
        result = await conn.fetchrow(query, days)
    return dict(result) if result else {}


@router.get("/api/analytics/mode-comparison")
async def get_mode_comparison(conn: asyncpg.Connection = Depends(get_db)):
    """Comparaison de performance entre modes CDI et Freelance."""
    rows = await conn.fetch("SELECT * FROM mode_performance_comparison")
    return [dict(r) for r in rows]
