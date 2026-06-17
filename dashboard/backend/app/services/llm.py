"""Appels LLM (API OpenAI, à la demande — pas de modèle local).

- summarize_repo : résume un repo GitHub pour le portfolio (+ catégorie).
- answer_question : chatbot RAG ancré sur les données réelles du portfolio.
"""
import json

from openai import AsyncOpenAI

from ..config import get_settings

# Taxonomie de catégories de projets (filtres du portfolio).
CATEGORIES = [
    "IA Générative / LLM",
    "IA Agentique",
    "Data Science / ML",
    "Data Engineering",
    "Application / Web",
    "Autre",
]

_SUMMARY_SYSTEM = (
    "Tu es un assistant qui résume des projets GitHub pour un portfolio "
    "d'ingénieur IA & data. Réponds en français, concis et orienté valeur."
)


def _client() -> AsyncOpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY n'est pas configuré dans l'environnement")
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def summarize_repo(name: str, description: str, readme: str, language: str | None) -> dict:
    """Résumé structuré d'un repo, prêt pour la DB."""
    settings = get_settings()
    prompt = (
        f"Repo: {name}\n"
        f"Langage principal: {language or 'inconnu'}\n"
        f"Description: {description or '(aucune)'}\n\n"
        f"README (tronqué):\n{readme[:6000]}\n\n"
        "Produis un JSON avec les clés exactes: title, short_pitch (1 phrase CV), "
        "long_desc (3-5 phrases structurées), tags (liste de mots-clés), "
        "stack (liste de technos), ai_confidence_score (entier 0-100), "
        f"category (UNE valeur parmi exactement: {CATEGORIES})."
    )
    resp = await _client().chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": _SUMMARY_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    data = json.loads(resp.choices[0].message.content)
    data.setdefault("tags", [])
    data.setdefault("stack", [])
    data.setdefault("ai_confidence_score", 50)
    if data.get("category") not in CATEGORIES:
        data["category"] = "Autre"
    return data


async def answer_question(question: str, context: str) -> str:
    """Chatbot du portfolio : répond uniquement à partir du contexte fourni."""
    settings = get_settings()
    system = (
        "Tu es l'assistant du portfolio de Raouf Addeche, ingénieur IA & data. "
        "Tu réponds aux visiteurs (recruteurs, clients) à propos de son parcours, ses "
        "compétences et ses projets, en français, sur un ton professionnel et chaleureux, "
        "à la première personne du pluriel ou en parlant de Raouf à la 3e personne. "
        "RÈGLE STRICTE : réponds UNIQUEMENT à partir des informations du CONTEXTE ci-dessous. "
        "Si l'information n'y est pas, dis simplement que tu ne disposes pas de cette "
        "information et invite à le contacter directement. Sois concis (2-4 phrases).\n\n"
        f"=== CONTEXTE ===\n{context}"
    )
    resp = await _client().chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
        max_tokens=350,
    )
    return resp.choices[0].message.content.strip()
