"""Appels LLM (API OpenAI, à la demande — pas de modèle local).

- summarize_repo : résume un repo GitHub pour le portfolio (+ catégorie).
- answer_question : chatbot RAG ancré sur les données réelles du portfolio.
"""
import json
from datetime import datetime

from openai import AsyncOpenAI

from ..config import get_settings

# Taxonomie de catégories de projets (filtres du portfolio).
CATEGORIES = [
    "IA Générative / LLM",
    "IA Agentique",
    "Data Science / ML",
    "Data Engineering",
    "MLOps / DevOps",
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
        "Produis un JSON avec les clés exactes: title, short_pitch (1 phrase CV en français), "
        "short_pitch_en (la même phrase en anglais), "
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
    data.setdefault("short_pitch_en", "")
    if data.get("category") not in CATEGORIES:
        data["category"] = "Autre"
    return data


async def answer_question(question: str, context: str, lang: str = "fr") -> str:
    """Chatbot du portfolio : répond naturellement, ancré sur le contexte fourni."""
    settings = get_settings()
    language = "anglais" if lang == "en" else "français"
    today = datetime.now().strftime("%d/%m/%Y")
    system = (
        f"Tu es l'assistant du portfolio de Raouf Addeche, ingénieur IA & Data. "
        f"Tu discutes avec des visiteurs (recruteurs, clients) en {language}, de façon "
        f"naturelle, fluide et professionnelle — comme un collègue bien informé qui parle "
        f"de Raouf, jamais comme un robot. Évite les formules toutes faites et les listes "
        f"sèches ; fais des phrases.\n\n"
        f"Tu peux RAISONNER à partir des informations : par exemple calculer une durée ou "
        f"un nombre d'années à partir des dates du parcours (la date du jour est le {today}). "
        f"Si une information précise est réellement absente du contexte, ne l'invente pas : "
        f"dis-le honnêtement en une courte phrase et propose de contacter Raouf, mais "
        f"enchaîne quand même avec ce que tu peux dire d'utile et de proche. "
        f"Réponds en {language}, 2 à 4 phrases.\n\n"
        f"=== CONTEXTE ===\n{context}"
    )
    resp = await _client().chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": question},
        ],
        temperature=0.5,
        max_tokens=400,
    )
    return resp.choices[0].message.content.strip()
