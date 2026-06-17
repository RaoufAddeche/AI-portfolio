"""Phase 2 : projets, blog, témoignages, stats GitHub et formulaire de contact."""
import json

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db import get_db
from ..models import BlogPost, ContactSubmission, GitHubStats, Project, Testimonial

router = APIRouter(tags=["showcase"])


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
    submission: ContactSubmission, conn: asyncpg.Connection = Depends(get_db)
):
    """Soumettre un formulaire de contact."""
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
    return {
        "success": True,
        "message": "Message envoyé avec succès!",
        "id": result["id"],
        "created_at": result["created_at"],
    }
