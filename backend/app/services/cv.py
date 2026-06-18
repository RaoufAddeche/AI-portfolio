"""Lecture du CV (PDF) comme base de connaissance du chatbot.

Le PDF est récupéré sur le frontend (réseau interne Docker) et son texte est
extrait puis mis en cache. Quand le CV servi change, le bot se met à jour tout
seul après expiration du cache — aucune donnée codée en dur.
"""
import io
import re
import time

import httpx
from pypdf import PdfReader

from ..config import get_settings

_TTL = 3600.0  # re-vérifie le CV au plus une fois par heure
_cache: dict = {"text": "", "ts": 0.0}


def _clean(text: str) -> str:
    """Recompose les mots si le PDF rend les caractères espacés (CV designés).

    Ne s'active que si > 40 % des tokens font 1 caractère (cas « E x p é r i e n c e »).
    Convention : 2+ espaces = vraie séparation de mots, 1 espace = espacement de glyphes.
    """
    tokens = text.split()
    if not tokens:
        return text
    singles = sum(1 for t in tokens if len(t) == 1)
    if singles / len(tokens) <= 0.4:
        return text  # extraction normale, on ne touche à rien
    out = []
    for line in text.split("\n"):
        line = re.sub(r" {2,}", "\x00", line).replace(" ", "").replace("\x00", " ")
        out.append(line)
    return "\n".join(out)


async def get_cv_text() -> str:
    """Texte du CV (caché). Renvoie le dernier connu si la récupération échoue."""
    now = time.monotonic()
    if _cache["text"] and now - _cache["ts"] < _TTL:
        return _cache["text"]
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(get_settings().cv_url)
            resp.raise_for_status()
        reader = PdfReader(io.BytesIO(resp.content))
        text = _clean("\n".join((page.extract_text() or "") for page in reader.pages).strip())
        if text:
            _cache["text"] = text
            _cache["ts"] = now
    except Exception:  # noqa: BLE001 (réseau/PDF) : on garde le dernier connu
        pass
    return _cache["text"]
