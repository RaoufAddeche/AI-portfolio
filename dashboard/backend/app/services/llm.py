"""Résumés de projets via l'API OpenAI, appelée à la demande (pas de LLM local).

Remplace l'ancienne stack Ollama : aucun modèle ne tourne en permanence,
on n'appelle l'API que lorsqu'un repo doit être (re)résumé.
"""
import json

from openai import AsyncOpenAI

from ..config import get_settings

_SYSTEM = (
    "Tu es un assistant qui résume des projets GitHub pour un portfolio "
    "de Data Scientist. Réponds en français, de façon concise et orientée valeur."
)


async def summarize_repo(name: str, description: str, readme: str, language: str | None) -> dict:
    """Génère un résumé structuré d'un repo. Renvoie un dict prêt pour la DB.

    Champs: title, short_pitch, long_desc, tags (list), stack (list),
    ai_confidence_score (0-100).
    """
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY n'est pas configuré dans l'environnement")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    prompt = (
        f"Repo: {name}\n"
        f"Langage principal: {language or 'inconnu'}\n"
        f"Description: {description or '(aucune)'}\n\n"
        f"README (tronqué):\n{readme[:6000]}\n\n"
        "Produis un JSON avec les clés exactes: title, short_pitch (1 phrase CV), "
        "long_desc (3-5 phrases structurées), tags (liste de mots-clés), "
        "stack (liste de technos), ai_confidence_score (entier 0-100 = confiance "
        "dans la pertinence pour un portfolio data)."
    )

    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    data = json.loads(resp.choices[0].message.content)
    data.setdefault("tags", [])
    data.setdefault("stack", [])
    data.setdefault("ai_confidence_score", 50)
    return data
