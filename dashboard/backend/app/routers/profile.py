"""Phase 1 : profil, timeline, compétences et liens sociaux."""
import json

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_db
from ..models import Profile, Skill, SocialLink, TimelineEvent

router = APIRouter(tags=["profile"])


@router.get("/api/profile", response_model=Profile)
async def get_profile(conn: asyncpg.Connection = Depends(get_db)):
    """Récupérer les informations de profil."""
    row = await conn.fetchrow("SELECT * FROM profile LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile(**dict(row))


@router.put("/api/profile")
async def update_profile(profile_data: dict, conn: asyncpg.Connection = Depends(get_db)):
    """Mettre à jour le profil (champs dynamiques)."""
    fields, values, param_count = [], [], 0
    for key, value in profile_data.items():
        if key not in ["id", "created_at", "updated_at"]:
            param_count += 1
            fields.append(f"{key} = ${param_count}")
            values.append(value)

    if not fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    query = f"UPDATE profile SET {', '.join(fields)} WHERE id = 1 RETURNING *"
    row = await conn.fetchrow(query, *values)
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile(**dict(row))


@router.get("/api/timeline", response_model=list[TimelineEvent])
async def get_timeline(
    category: str | None = Query(None, description="Filter by category"),
    highlights_only: bool = Query(False, description="Show only highlights"),
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
        event = dict(row)
        event["tags"] = list(event["tags"]) if event["tags"] else []
        if isinstance(event.get("metrics"), str):
            event["metrics"] = json.loads(event["metrics"]) if event["metrics"] else {}
        events.append(TimelineEvent(**event))
    return events


@router.post("/api/timeline")
async def create_timeline_event(event: dict, conn: asyncpg.Connection = Depends(get_db)):
    """Créer un nouvel événement dans la timeline."""
    row = await conn.fetchrow(
        """
        INSERT INTO timeline_events
            (date, end_date, title, description, category, icon, metrics, tags,
             link_url, display_order, is_highlight)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        """,
        event.get("date"),
        event.get("end_date"),
        event.get("title"),
        event.get("description"),
        event.get("category"),
        event.get("icon"),
        json.dumps(event.get("metrics")) if event.get("metrics") else None,
        event.get("tags", []),
        event.get("link_url"),
        event.get("display_order", 0),
        event.get("is_highlight", False),
    )
    result = dict(row)
    result["tags"] = list(result["tags"]) if result["tags"] else []
    return TimelineEvent(**result)


@router.get("/api/skills", response_model=list[Skill])
async def get_skills(
    category: str | None = Query(None, description="Filter by category"),
    primary_only: bool = Query(False, description="Show only primary skills"),
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
    return [Skill(**dict(row)) for row in rows]


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
