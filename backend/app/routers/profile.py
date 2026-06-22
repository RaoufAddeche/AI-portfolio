"""Phase 1 : profil, timeline, compétences et liens sociaux."""
import json

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_db
from ..i18n import localize
from ..models import Profile, Skill, SocialLink, TimelineEvent

router = APIRouter(tags=["profile"])


@router.get("/api/profile", response_model=Profile)
async def get_profile(
    lang: str = Query("fr"), conn: asyncpg.Connection = Depends(get_db)
):
    """Récupérer les informations de profil."""
    row = await conn.fetchrow("SELECT * FROM profile LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    data = localize(dict(row), lang, ["title", "bio", "hero_pitch", "availability"])
    return Profile(**data)


@router.get("/api/timeline", response_model=list[TimelineEvent])
async def get_timeline(
    category: str | None = Query(None, description="Filter by category"),
    highlights_only: bool = Query(False, description="Show only highlights"),
    lang: str = Query("fr"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les événements de la timeline."""
    query = "SELECT * FROM timeline_events WHERE 1=1"
    params, param_count = [], 0

    if category:
        param_count += 1
        query += f" AND category = ${param_count}"
        params.append(category)
    if highlights_only:
        query += " AND is_highlight = TRUE"

    query += " ORDER BY date ASC, display_order ASC"
    rows = await conn.fetch(query, *params)

    events = []
    for row in rows:
        event = localize(dict(row), lang, ["title", "description"])
        event["tags"] = list(event["tags"]) if event["tags"] else []
        if isinstance(event.get("metrics"), str):
            event["metrics"] = json.loads(event["metrics"]) if event["metrics"] else {}
        events.append(TimelineEvent(**event))
    return events


@router.get("/api/skills", response_model=list[Skill])
async def get_skills(
    category: str | None = Query(None, description="Filter by category"),
    primary_only: bool = Query(False, description="Show only primary skills"),
    lang: str = Query("fr"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les compétences."""
    query = "SELECT * FROM skills WHERE 1=1"
    params, param_count = [], 0
    if category:
        param_count += 1
        query += f" AND category = ${param_count}"
        params.append(category)
    if primary_only:
        query += " AND is_primary = TRUE"
    query += " ORDER BY category, proficiency_level DESC, name ASC"

    rows = await conn.fetch(query, *params)
    return [Skill(**localize(dict(row), lang, ["subcategory", "name"])) for row in rows]


@router.get("/api/skills/grouped")
async def get_skills_grouped(conn: asyncpg.Connection = Depends(get_db)):
    """Récupérer les compétences groupées par catégorie."""
    rows = await conn.fetch(
        """
        SELECT category, subcategory, json_agg(
            json_build_object(
                'id', id, 'name', name, 'proficiency_level', proficiency_level,
                'years_experience', years_experience, 'is_primary', is_primary, 'icon', icon
            ) ORDER BY proficiency_level DESC, name
        ) as skills
        FROM skills
        GROUP BY category, subcategory
        ORDER BY category
        """
    )
    result: dict = {}
    for row in rows:
        category, subcategory = row["category"], row["subcategory"]
        skills = json.loads(row["skills"]) if isinstance(row["skills"], str) else row["skills"]
        result.setdefault(category, {})
        if subcategory:
            result[category][subcategory] = skills
        else:
            result[category].setdefault("other", []).extend(skills)
    return result


@router.get("/api/social-links", response_model=list[SocialLink])
async def get_social_links(
    active_only: bool = Query(True, description="Show only active links"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les liens sociaux."""
    query = "SELECT * FROM social_links"
    if active_only:
        query += " WHERE is_active = TRUE"
    query += " ORDER BY display_order ASC"
    rows = await conn.fetch(query)
    return [SocialLink(**dict(row)) for row in rows]
