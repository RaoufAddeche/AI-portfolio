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


async def answer_question(
    question: str, context: str, lang: str = "fr", history: list[dict] | None = None
) -> str:
    """Chatbot du portfolio : répond naturellement, avec mémoire de la conversation."""
    settings = get_settings()
    language = "anglais" if lang == "en" else "français"
    today = datetime.now().strftime("%d/%m/%Y")
    system = (
        f"Tu es l'assistant d'un portfolio professionnel. Tu réponds aux visiteurs "
        f"(recruteurs, clients) à propos de la personne présentée dans le CONTEXTE ci-dessous "
        f"(son nom figure dans le champ « Nom »), en {language}, de façon naturelle, fluide et "
        f"professionnelle — comme un collègue bien informé qui parle d'elle, jamais comme un "
        f"robot. Évite les formules toutes faites et les listes sèches ; fais des phrases. "
        f"Tiens compte des messages précédents de la conversation (l'historique t'est fourni) "
        f"pour répondre aux questions de suivi.\n\n"
        f"Tu peux RAISONNER à partir des informations : calculer une durée à partir des dates "
        f"du parcours (date du jour : {today}). Sois précis et honnête sur les durées : "
        f"distingue bien l'ancienneté GLOBALE (depuis le tout premier poste) de l'expérience "
        f"dans un DOMAINE précis (ex. data/IA) ou sous un INTITULÉ donné (ex. Développeur IA) "
        f"— appuie-toi sur les dates du parcours et précise de quoi tu parles. "
        f"Si une information précise est réellement absente, ne l'invente pas : dis-le "
        f"honnêtement et propose de contacter Raouf, mais enchaîne avec ce que tu sais d'utile. "
        f"Réponds en {language}, 2 à 4 phrases.\n\n"
        f"=== CONTEXTE ===\n{context}"
    )
    messages = [{"role": "system", "content": system}]
    for m in (history or [])[-8:]:  # mémoire courte : 8 derniers échanges max
        if m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
            messages.append({"role": m["role"], "content": m["content"][:1500]})
    messages.append({"role": "user", "content": question})

    resp = await _client().chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.5,
        max_tokens=400,
    )
    return resp.choices[0].message.content.strip()
