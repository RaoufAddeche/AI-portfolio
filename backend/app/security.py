"""Dépendance d'authentification admin (en-tête X-Admin-Token).

Centralisée ici pour être partagée par tous les routers d'administration
(curation des projets, édition du contenu du portfolio…).
"""
from fastapi import Header, HTTPException

from .config import get_settings


def require_admin(x_admin_token: str | None = Header(None)) -> None:
    """Vérifie le token d'admin (401 sinon, 503 si non configuré)."""
    token = get_settings().admin_token
    if not token:
        raise HTTPException(status_code=503, detail="Admin non configuré (ADMIN_TOKEN)")
    if x_admin_token != token:
        raise HTTPException(status_code=401, detail="Token admin invalide")
