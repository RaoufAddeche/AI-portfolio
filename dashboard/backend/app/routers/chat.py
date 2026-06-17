"""Chatbot du portfolio (RAG léger ancré sur les données réelles de la base).

Garde-fous anti-spam / protection du budget LLM :
- rate-limit par IP (fenêtre glissante en mémoire) ;
- plafond quotidien global d'appels (compté en base, robuste aux redémarrages).
"""
import time
from collections import defaultdict, deque

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from ..config import get_settings
from ..db import get_db
from ..services import llm

router = APIRouter(prefix="/api/chat", tags=["chat"])

_WINDOW_SECONDS = 60.0
_hits: dict[str, deque] = defaultdict(deque)


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


def _client_ip(request: Request) -> str:
    """IP réelle du client derrière le reverse-proxy (nginx pose ces en-têtes)."""
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.headers.get("x-real-ip") or (request.client.host if request.client else "unknown")


def _rate_limited(ip: str, limit: int) -> bool:
    """Fenêtre glissante d'une minute par IP."""
    now = time.monotonic()
    dq = _hits[ip]
    while dq and now - dq[0] > _WINDOW_SECONDS:
        dq.popleft()
    if len(dq) >= limit:
        return True
    dq.append(now)
    return False


async def _build_context(conn: asyncpg.Connection) -> str:
    """Concatène les données du portfolio en un contexte texte compact."""
    parts: list[str] = []

    profile = await conn.fetchrow("SELECT * FROM profile LIMIT 1")
    if profile:
        parts.append(
            f"PROFIL\nNom: {profile['full_name']}\nTitre: {profile['title']}\n"
            f"Bio: {profile['bio']}\nAccroche: {profile['hero_pitch']}\n"
            f"Localisation: {profile['location']} ({profile['availability']})\n"
            f"Email: {profile['email']}"
        )

    timeline = await conn.fetch(
        "SELECT date, end_date, title, description, category FROM timeline_events ORDER BY date"
    )
    if timeline:
        lines = [
            f"- [{e['category']}] {e['title']} ({e['date']:%Y}"
            f"{('–' + format(e['end_date'], '%Y')) if e['end_date'] else ''}): {e['description']}"
            for e in timeline
        ]
        parts.append("PARCOURS\n" + "\n".join(lines))

    skills = await conn.fetch("SELECT name FROM skills ORDER BY subcategory, name")
    if skills:
        parts.append("COMPÉTENCES\n" + ", ".join(s["name"] for s in skills))

    projects = await conn.fetch(
        "SELECT title, short_pitch, stack, github_url, category FROM portfolio_items "
        "ORDER BY ai_confidence_score DESC LIMIT 20"
    )
    if projects:
        lines = [
            f"- {p['title']} [{p['category'] or 'projet'}]: {p['short_pitch']} "
            f"(stack: {', '.join(p['stack']) if p['stack'] else 'n/a'}; {p['github_url']})"
            for p in projects
        ]
        parts.append("PROJETS\n" + "\n".join(lines))

    return "\n\n".join(parts)


@router.post("")
async def chat(
    req: ChatRequest, request: Request, conn: asyncpg.Connection = Depends(get_db)
):
    """Répond à une question du visiteur, ancré sur les données du portfolio."""
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="Chatbot indisponible (LLM non configuré)")

    # 1) Rate-limit par IP
    if _rate_limited(_client_ip(request), settings.chat_rate_per_minute):
        raise HTTPException(
            status_code=429,
            detail="Trop de messages d'affilée. Patientez un instant avant de réessayer.",
        )

    # 2) Plafond quotidien global (protection du budget LLM)
    used_today = await conn.fetchval(
        "SELECT COUNT(*) FROM chatbot_conversations WHERE created_at >= CURRENT_DATE"
    )
    if used_today is not None and used_today >= settings.chat_daily_limit:
        raise HTTPException(
            status_code=429,
            detail="L'assistant a atteint sa limite pour aujourd'hui. "
            "Contactez Raouf directement via le formulaire.",
        )

    context = await _build_context(conn)
    try:
        answer = await llm.answer_question(req.question, context)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"LLM: {exc}") from exc

    try:
        await conn.execute(
            "INSERT INTO chatbot_conversations (session_id, question, answer) VALUES ($1, $2, $3)",
            _client_ip(request),
            req.question,
            answer,
        )
    except asyncpg.PostgresError:
        pass  # le log est optionnel

    return {"answer": answer}
