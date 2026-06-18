"""Phase 2 : projets, blog, témoignages, stats GitHub et formulaire de contact."""
import hashlib
import hmac
import json
import time
from collections import defaultdict, deque

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import HTMLResponse

from ..config import get_settings
from ..db import get_db
from ..models import (
    BlogPost,
    ContactSubmission,
    GitHubStats,
    Project,
    Testimonial,
    TestimonialSubmission,
)
from ..services import email

router = APIRouter(tags=["showcase"])

# Anti-spam des soumissions publiques : fenêtre glissante par IP.
_testi_hits: dict[str, deque] = defaultdict(deque)
_contact_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown")


def _rate_limited(store: dict[str, deque], ip: str, limit: int, window: float = 600.0) -> bool:
    now = time.monotonic()
    dq = store[ip]
    while dq and now - dq[0] > window:
        dq.popleft()
    if len(dq) >= limit:
        return True
    dq.append(now)
    return False


def _approve_signature(item_id: int, secret: str) -> str:
    return hmac.new(secret.encode(), str(item_id).encode(), hashlib.sha256).hexdigest()[:32]


def _project_from_row(row) -> Project:
    result = dict(row)
    result["tags"] = list(result["tags"]) if result["tags"] else []
    result["technologies"] = list(result["technologies"]) if result["technologies"] else []
    if isinstance(result.get("metrics"), str):
        result["metrics"] = json.loads(result["metrics"]) if result["metrics"] else {}
    return Project(**result)


@router.get("/api/projects", response_model=list[Project])
async def get_projects(
    category: str | None = Query(None, description="Filter by category"),
    featured_only: bool = Query(False, description="Show only featured projects"),
    published_only: bool = Query(True, description="Show only published projects"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les projets."""
    query = "SELECT * FROM projects WHERE 1=1"
    params, param_count = [], 0
    if published_only:
        query += " AND is_published = TRUE"
    if featured_only:
        query += " AND is_featured = TRUE"
    if category:
        param_count += 1
        query += f" AND category = ${param_count}"
        params.append(category)
    query += " ORDER BY display_order ASC, project_date DESC"

    rows = await conn.fetch(query, *params)
    return [_project_from_row(row) for row in rows]


@router.get("/api/projects/{slug}", response_model=Project)
async def get_project(slug: str, conn: asyncpg.Connection = Depends(get_db)):
    """Récupérer un projet spécifique par slug."""
    row = await conn.fetchrow(
        "SELECT * FROM projects WHERE slug = $1 AND is_published = TRUE", slug
    )
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_from_row(row)


@router.get("/api/blog", response_model=list[BlogPost])
async def get_blog_posts(
    category: str | None = Query(None, description="Filter by category"),
    featured_only: bool = Query(False, description="Show only featured posts"),
    published_only: bool = Query(True, description="Show only published posts"),
    limit: int = Query(10, ge=1, le=50, description="Number of posts to return"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les articles de blog."""
    query = "SELECT * FROM blog_posts WHERE 1=1"
    params, param_count = [], 0
    if published_only:
        query += " AND is_published = TRUE"
    if featured_only:
        query += " AND is_featured = TRUE"
    if category:
        param_count += 1
        query += f" AND category = ${param_count}"
        params.append(category)
    query += " ORDER BY published_at DESC NULLS LAST"
    param_count += 1
    query += f" LIMIT ${param_count}"
    params.append(limit)

    rows = await conn.fetch(query, *params)
    results = []
    for row in rows:
        result = dict(row)
        result["keywords"] = list(result["keywords"]) if result["keywords"] else []
        result["tags"] = list(result["tags"]) if result["tags"] else []
        results.append(BlogPost(**result))
    return results


@router.get("/api/blog/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str, conn: asyncpg.Connection = Depends(get_db)):
    """Récupérer un article de blog par slug (incrémente le compteur de vues)."""
    row = await conn.fetchrow(
        "SELECT * FROM blog_posts WHERE slug = $1 AND is_published = TRUE", slug
    )
    if not row:
        raise HTTPException(status_code=404, detail="Blog post not found")

    result = dict(row)
    result["keywords"] = list(result["keywords"]) if result["keywords"] else []
    result["tags"] = list(result["tags"]) if result["tags"] else []
    await conn.execute(
        "UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1", result["id"]
    )
    return BlogPost(**result)


@router.get("/api/testimonials", response_model=list[Testimonial])
async def get_testimonials(
    featured_only: bool = Query(False, description="Show only featured testimonials"),
    published_only: bool = Query(True, description="Show only published testimonials"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Récupérer les témoignages."""
    query = "SELECT * FROM testimonials WHERE 1=1"
    if published_only:
        query += " AND is_published = TRUE"
    if featured_only:
        query += " AND is_featured = TRUE"
    query += " ORDER BY display_order ASC, date_given DESC NULLS LAST"
    rows = await conn.fetch(query)
    return [Testimonial(**dict(row)) for row in rows]


@router.post("/api/testimonials")
async def submit_testimonial(
    submission: TestimonialSubmission,
    request: Request,
    conn: asyncpg.Connection = Depends(get_db),
):
    """Soumettre un avis. Stocké NON publié → notification email avec lien d'approbation."""
    if _rate_limited(_testi_hits, _client_ip(request), 3):
        raise HTTPException(status_code=429, detail="Trop d'envois. Réessayez plus tard.")

    row = await conn.fetchrow(
        """
        INSERT INTO testimonials
            (author_name, author_title, author_company, author_linkedin_url,
             relationship, quote, is_published, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, FALSE, FALSE)
        RETURNING id
        """,
        submission.author_name,
        submission.author_title,
        submission.author_company,
        submission.author_linkedin_url,
        submission.relationship,
        submission.quote,
    )

    settings = get_settings()
    approve_url = None
    if settings.admin_token:
        sig = _approve_signature(row["id"], settings.admin_token)
        approve_url = (
            f"{settings.public_base_url}/api/testimonials/{row['id']}/approve?token={sig}"
        )
    try:
        await email.send_testimonial_notification(
            submission.author_name,
            submission.author_title,
            submission.author_company,
            submission.quote,
            approve_url,
        )
    except Exception:  # noqa: BLE001
        pass

    return {"success": True, "message": "Merci ! Votre avis sera publié après validation."}


@router.get("/api/testimonials/{item_id}/approve", response_class=HTMLResponse)
async def approve_testimonial(
    item_id: int, token: str, conn: asyncpg.Connection = Depends(get_db)
):
    """Publier un avis depuis le lien signé reçu par email (modération en un clic)."""
    settings = get_settings()
    if not settings.admin_token:
        raise HTTPException(status_code=503, detail="Modération non configurée (ADMIN_TOKEN)")
    if not hmac.compare_digest(token, _approve_signature(item_id, settings.admin_token)):
        raise HTTPException(status_code=403, detail="Lien d'approbation invalide")

    result = await conn.execute(
        "UPDATE testimonials SET is_published = TRUE, is_featured = TRUE, "
        "updated_at = NOW() WHERE id = $1",
        item_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Avis introuvable")

    return HTMLResponse(
        "<html><body style=\"font-family:system-ui;text-align:center;padding:4rem\">"
        "<h2>Avis approuvé ✅</h2><p>Il est maintenant visible sur le portfolio.</p>"
        "</body></html>"
    )


@router.get("/api/github-stats", response_model=GitHubStats)
async def get_github_stats(
    username: str | None = None, conn: asyncpg.Connection = Depends(get_db)
):
    """Récupérer les statistiques GitHub stockées."""
    if username:
        row = await conn.fetchrow(
            "SELECT * FROM github_stats WHERE username = $1 ORDER BY last_fetched_at DESC LIMIT 1",
            username,
        )
    else:
        row = await conn.fetchrow(
            "SELECT * FROM github_stats ORDER BY last_fetched_at DESC LIMIT 1"
        )
    if not row:
        raise HTTPException(status_code=404, detail="GitHub stats not found")

    result = dict(row)
    if isinstance(result.get("languages"), str):
        result["languages"] = json.loads(result["languages"]) if result["languages"] else {}
    if isinstance(result.get("top_repos"), str):
        result["top_repos"] = json.loads(result["top_repos"]) if result["top_repos"] else []
    return GitHubStats(**result)


@router.post("/api/contact")
async def submit_contact_form(
    submission: ContactSubmission,
    request: Request,
    conn: asyncpg.Connection = Depends(get_db),
):
    """Soumettre un formulaire de contact (anti-spam : max 5 / 10 min par IP)."""
    if _rate_limited(_contact_hits, _client_ip(request), 5):
        raise HTTPException(status_code=429, detail="Trop d'envois. Réessayez plus tard.")
    result = await conn.fetchrow(
        """
        INSERT INTO contact_submissions
            (name, email, company, subject, message, contact_reason, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'new')
        RETURNING id, created_at
        """,
        submission.name,
        submission.email,
        submission.company,
        submission.subject,
        submission.message,
        submission.contact_reason,
    )
    # Notification best-effort : le message est déjà en base, on n'échoue pas si l'email casse.
    try:
        await email.send_contact_notification(
            submission.name, submission.email, submission.subject, submission.message
        )
    except Exception:  # noqa: BLE001
        pass
    return {
        "success": True,
        "message": "Message envoyé avec succès!",
        "id": result["id"],
        "created_at": result["created_at"],
    }
