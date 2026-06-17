"""Chatbot du portfolio (RAG léger ancré sur les données réelles de la base)."""
import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..config import get_settings
from ..db import get_db
from ..services import llm

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


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

    skills = await conn.fetch("SELECT name, subcategory FROM skills ORDER BY subcategory, name")
    if skills:
        parts.append(
            "COMPÉTENCES\n"
            + ", ".join(f"{s['name']}" for s in skills)
        )

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
async def chat(req: ChatRequest, conn: asyncpg.Connection = Depends(get_db)):
    """Répond à une question du visiteur, ancré sur les données du portfolio."""
    if not get_settings().openai_api_key:
        raise HTTPException(status_code=503, detail="Chatbot indisponible (LLM non configuré)")

    context = await _build_context(conn)
    try:
        answer = await llm.answer_question(req.question, context)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"LLM: {exc}") from exc

    # Journalise la conversation (table existante chatbot_conversations si présente).
    try:
        await conn.execute(
            "INSERT INTO chatbot_conversations (session_id, question, answer) "
            "VALUES ($1, $2, $3)",
            "web",
            req.question,
            answer,
        )
    except asyncpg.PostgresError:
        pass  # la table de log est optionnelle

    return {"answer": answer}
