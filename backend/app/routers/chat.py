"""Chatbot du portfolio (RAG léger ancré sur les données réelles de la base).

Garde-fous anti-spam / protection du budget LLM :
- rate-limit par IP (fenêtre glissante en mémoire) ;
- plafond quotidien global d'appels (compté en base, robuste aux redémarrages).
"""
import time
from collections import defaultdict, deque
from pathlib import Path

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from ..config import get_settings
from ..db import get_db
from ..i18n import localize
from ..services import llm

router = APIRouter(prefix="/api/chat", tags=["chat"])

_WINDOW_SECONDS = 60.0
_hits: dict[str, deque] = defaultdict(deque)

# Fiche de connaissance (CV) chargée une fois — base factuelle du chatbot.
try:
    _CV = (Path(__file__).resolve().parents[1] / "knowledge.md").read_text(encoding="utf-8")
except OSError:
    _CV = ""


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    lang: str = "fr"


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


async def _build_context(conn: asyncpg.Connection, lang: str = "fr") -> str:
    """Concatène les données du portfolio (localisées) en un contexte texte compact."""
    parts: list[str] = []

    if _CV:
        parts.append(_CV)

    row = await conn.fetchrow("SELECT * FROM profile LIMIT 1")
    if row:
        p = localize(dict(row), lang, ["title", "bio", "hero_pitch", "availability"])
        parts.append(
            f"PROFIL\nNom: {p['full_name']}\nTitre: {p['title']}\n"
            f"Bio: {p['bio']}\nAccroche: {p['hero_pitch']}\n"
            f"Localisation: {p['location']} ({p['availability']})\n"
            f"Email: {p['email']}"
        )

    timeline = await conn.fetch("SELECT * FROM timeline_events ORDER BY date")
    if timeline:
        lines = []
        for e in (localize(dict(r), lang, ["title", "description"]) for r in timeline):
            span = e["date"].strftime("%Y") + (f"–{e['end_date']:%Y}" if e["end_date"] else "")
            lines.append(f"- [{e['category']}] {e['title']} ({span}): {e['description']}")
        parts.append("PARCOURS\n" + "\n".join(lines))

    skills = await conn.fetch("SELECT name FROM skills ORDER BY subcategory, name")
    if skills:
        parts.append("COMPÉTENCES\n" + ", ".join(s["name"] for s in skills))

    projects = await conn.fetch(
        "SELECT title, short_pitch, short_pitch_en, stack, github_url, category "
        "FROM portfolio_items ORDER BY ai_confidence_score DESC LIMIT 20"
    )
    if projects:
        lines = []
        for p in (localize(dict(r), lang, ["short_pitch"]) for r in projects):
            stack = ", ".join(p["stack"]) if p["stack"] else "n/a"
            lines.append(
                f"- {p['title']} [{p['category'] or 'projet'}]: {p['short_pitch']} "
                f"(stack: {stack}; {p['github_url']})"
            )
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

    context = await _build_context(conn, req.lang)
    try:
        answer = await llm.answer_question(req.question, context, req.lang)
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
