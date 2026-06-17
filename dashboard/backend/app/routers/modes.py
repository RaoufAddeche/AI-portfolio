"""Phase 3 : dual mode (CDI / Freelance) et contenu adapté au mode."""
import json

import asyncpg
from fastapi import APIRouter, Depends, Query

from ..db import get_db
from ..models import PortfolioMode, Project

router = APIRouter(tags=["modes"])


@router.get("/api/modes", response_model=list[PortfolioMode])
async def get_portfolio_modes(
    active_only: bool = Query(True, description="Show only active modes"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Modes de portfolio disponibles."""
    query = "SELECT * FROM portfolio_modes"
    if active_only:
        query += " WHERE is_active = TRUE"
    query += " ORDER BY is_default DESC, mode_key"

    rows = await conn.fetch(query)
    results = []
    for row in rows:
        result = dict(row)
        if isinstance(result.get("settings"), str):
            result["settings"] = json.loads(result["settings"]) if result["settings"] else {}
        results.append(PortfolioMode(**result))
    return results


@router.get("/api/content/{content_type}")
async def get_content_with_mode(
    content_type: str,
    mode: str = Query("cdi", description="Portfolio mode (cdi or freelance)"),
    content_id: int | None = Query(None, description="Specific content ID"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer le contenu avec les overrides spécifiques au mode."""
    override_query = """
        SELECT override_field, override_value
        FROM mode_content_overrides
        WHERE mode_key = $1 AND content_type = $2 AND is_active = TRUE
    """
    params = [mode, content_type]
    if content_id is not None:
        override_query += " AND content_id = $3"
        params.append(content_id)
    else:
        override_query += " AND content_id IS NULL"
    override_query += " ORDER BY priority DESC"

    overrides = await conn.fetch(override_query, *params)
    override_dict = {r["override_field"]: r["override_value"] for r in overrides}
    return {"mode": mode, "content_type": content_type, "overrides": override_dict}


@router.get("/api/mode-projects", response_model=list[Project])
async def get_mode_projects(
    mode: str = Query("cdi", description="Portfolio mode"),
    featured_only: bool = Query(False, description="Featured only"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Projets filtrés et priorisés selon le mode."""
    query = """
        SELECT *, (mode_priority->>$1)::INTEGER as priority
        FROM projects
        WHERE is_published = TRUE AND $1 = ANY(target_modes)
    """
    params = [mode]
    if featured_only:
        query += " AND is_featured = TRUE"
    query += " ORDER BY priority DESC NULLS LAST, project_date DESC"

    rows = await conn.fetch(query, *params)
    results = []
    for row in rows:
        result = dict(row)
        result["tags"] = list(result["tags"]) if result["tags"] else []
        result["technologies"] = list(result["technologies"]) if result["technologies"] else []
        if isinstance(result.get("metrics"), str):
            result["metrics"] = json.loads(result["metrics"]) if result["metrics"] else {}
        result.pop("priority", None)
        result.pop("mode_priority", None)
        result.pop("target_modes", None)
        results.append(Project(**result))
    return results
