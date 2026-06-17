"""Études de cas : projets phares racontés en profondeur."""
import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..models import CaseStudy

router = APIRouter(tags=["case-studies"])


def _normalize(row) -> dict:
    cs = dict(row)
    cs["architecture"] = cs["architecture"] if cs["architecture"] else []
    cs["stack"] = list(cs["stack"]) if cs["stack"] else []
    cs["results"] = list(cs["results"]) if cs["results"] else []
    cs["tags"] = list(cs["tags"]) if cs["tags"] else []
    return cs


@router.get("/api/case-studies", response_model=list[CaseStudy])
async def list_case_studies(conn: asyncpg.Connection = Depends(get_db)):
    """Liste des études de cas publiées."""
    rows = await conn.fetch(
        "SELECT * FROM case_studies WHERE is_published = TRUE "
        "ORDER BY display_order ASC, created_at DESC"
    )
    return [CaseStudy(**_normalize(r)) for r in rows]


@router.get("/api/case-studies/{slug}", response_model=CaseStudy)
async def get_case_study(slug: str, conn: asyncpg.Connection = Depends(get_db)):
    """Une étude de cas par slug."""
    row = await conn.fetchrow(
        "SELECT * FROM case_studies WHERE slug = $1 AND is_published = TRUE", slug
    )
    if not row:
        raise HTTPException(status_code=404, detail="Case study not found")
    return CaseStudy(**_normalize(row))
