"""Administration (curation) — protégée par ADMIN_TOKEN (en-tête X-Admin-Token).

Permet de valider les projets, corriger les catégories, modérer les avis et
relire les messages de contact, sans toucher à la base manuellement.
"""
import asyncpg
from fastapi import APIRouter, Depends, Header, HTTPException

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
