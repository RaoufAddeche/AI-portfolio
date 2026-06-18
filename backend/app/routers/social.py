"""Liens de partage social (LinkedIn / StackOverflow / Twitter) + stats de partage."""
import json
import urllib.parse
from datetime import datetime

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse

from ..db import get_db

router = APIRouter(tags=["social"])


async def _log_share(conn, repo: str, action: str, item_id: int, platform: str) -> None:
    await conn.execute(
        """
        INSERT INTO portfolio_events (source, repo, action, payload, status)
        VALUES ($1, $2, $3, $4, $5)
        """,
        "social_share",
        repo,
        action,
        json.dumps({"item_id": item_id, "platform": platform,
                    "shared_at": datetime.now().isoformat()}),
        "ok",
    )


@router.get("/api/share/linkedin/{item_id}")
async def share_on_linkedin(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    """Générer un lien de partage LinkedIn pour un projet."""
    row = await conn.fetchrow("SELECT * FROM portfolio_items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    title, description, url = row["title"], row["short_pitch"], row["github_url"]
    linkedin_text = (
        f"🚀 Nouveau projet: {title}\n\n{description}\n\n"
        f"💡 Technologies: {', '.join(row['stack']) if row['stack'] else 'N/A'}\n\n"
        f"#Developer #TechInnovation #Portfolio #GitHub\n\nVoir le code source: {url}"
    )
    linkedin_share_url = (
        "https://www.linkedin.com/sharing/share-offsite/"
        f"?url={urllib.parse.quote(url)}&title={urllib.parse.quote(title)}"
        f"&summary={urllib.parse.quote(linkedin_text)}"
    )
    await _log_share(conn, row["repo"], "linkedin_share", item_id, "linkedin")
    return RedirectResponse(url=linkedin_share_url)


@router.get("/api/share/stackoverflow/{item_id}")
async def share_on_stackoverflow(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    """Générer un lien pour poser une question StackOverflow liée au projet."""
    row = await conn.fetchrow("SELECT * FROM portfolio_items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    title = f"Best practices for {row['github_language']} project: {row['title']}"
    body = (
        f"I'm working on a {row['github_language']} project called \"{row['title']}\".\n\n"
        f"**Project Description:**\n{row['short_pitch']}\n\n"
        f"**Technologies used:**\n{', '.join(row['stack']) if row['stack'] else 'N/A'}\n\n"
        f"**GitHub Repository:** {row['github_url']}\n\n"
        "I'm looking for feedback on best practices and potential improvements."
    )
    tags = ",".join(
        [row["github_language"].lower() if row["github_language"] else "programming"]
        + [t.lower().replace(" ", "-") for t in (row["tags"][:3] if row["tags"] else [])]
    )
    stackoverflow_url = (
        "https://stackoverflow.com/questions/ask"
        f"?title={urllib.parse.quote(title)}&body={urllib.parse.quote(body)}"
        f"&tags={urllib.parse.quote(tags)}"
    )
    await _log_share(conn, row["repo"], "stackoverflow_share", item_id, "stackoverflow")
    return RedirectResponse(url=stackoverflow_url)


@router.get("/api/share/twitter/{item_id}")
async def share_on_twitter(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    """Générer un lien de partage Twitter pour un projet."""
    row = await conn.fetchrow("SELECT * FROM portfolio_items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    title, url = row["title"], row["github_url"]
    main_tech = row["github_language"] or "Tech"
    tweet_text = f"🚀 Just built: {title}\n\n💻 {main_tech}"
    if row["stack"]:
        hashtags = " ".join(
            f"#{t.replace(' ', '').replace('.', '').replace('-', '')}" for t in row["stack"][:2]
        )
        tweet_text += f" {hashtags}"
    tweet_text += f"\n\n#Developer #GitHub #OpenSource\n\n{url}"

    twitter_url = f"https://twitter.com/intent/tweet?text={urllib.parse.quote(tweet_text)}"
    await _log_share(conn, row["repo"], "twitter_share", item_id, "twitter")
    return RedirectResponse(url=twitter_url)


@router.get("/api/social-analytics")
async def get_social_analytics(conn: asyncpg.Connection = Depends(get_db)):
    """Statistiques de partage social."""
    stats = await conn.fetch(
        """
        SELECT payload->>'platform' as platform, COUNT(*) as shares, MAX(ts) as last_share
        FROM portfolio_events
        WHERE action LIKE '%_share'
        GROUP BY payload->>'platform'
        ORDER BY shares DESC
        """
    )
    project_stats = await conn.fetch(
        """
        SELECT repo,
               COUNT(*) as total_shares,
               COUNT(*) FILTER (WHERE payload->>'platform' = 'linkedin') as linkedin_shares,
               COUNT(*) FILTER (WHERE payload->>'platform' = 'twitter') as twitter_shares,
               COUNT(*) FILTER (WHERE payload->>'platform' = 'stackoverflow') as stackoverflow_shares
        FROM portfolio_events
        WHERE action LIKE '%_share'
        GROUP BY repo
        ORDER BY total_shares DESC
        """
    )
    return {
        "platform_stats": [dict(r) for r in stats],
        "project_stats": [dict(r) for r in project_stats],
        "total_shares": sum(r["shares"] for r in stats),
    }
