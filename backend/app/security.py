"""Dépendance d'authentification admin (en-tête X-Admin-Token).

Centralisée ici pour être partagée par tous les routers d'administration
(curation des projets, édition du contenu du portfolio…).
Anti force brute : 5 essais ratés par IP en 15 min → blocage (429) jusqu'à la fin de la fenêtre.
"""
import hmac
import time
from collections import defaultdict, deque

from fastapi import Header, HTTPException, Request

from .config import get_settings

_MAX_ECHECS = 5
_FENETRE = 900.0  # secondes
_echecs: dict[str, deque] = defaultdict(deque)


def _ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown")


def require_admin(request: Request, x_admin_token: str | None = Header(None)) -> None:
    """Vérifie le token d'admin (401 sinon, 429 après trop d'échecs, 503 si non configuré)."""
    token = get_settings().admin_token
    if not token:
        raise HTTPException(status_code=503, detail="Admin non configuré (ADMIN_TOKEN)")
    ip = _ip(request)
    echecs = _echecs[ip]
    maintenant = time.monotonic()
    while echecs and maintenant - echecs[0] > _FENETRE:
        echecs.popleft()
    if len(echecs) >= _MAX_ECHECS:
        raise HTTPException(status_code=429, detail="Trop d'essais. Réessayez dans 15 minutes.")
    if not x_admin_token or not hmac.compare_digest(x_admin_token.encode(), token.encode()):
        echecs.append(maintenant)
        raise HTTPException(status_code=401, detail="Token admin invalide")
    echecs.clear()
