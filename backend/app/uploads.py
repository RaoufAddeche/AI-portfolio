"""Stockage des fichiers uploadés (photo de profil, CV) sur volume persistant.

En conteneur, WORKDIR=/app et le volume Docker est monté sur /app/uploads ;
le chemin relatif « uploads » s'y résout donc naturellement. En local
(cwd=backend/), c'est backend/uploads. Surclassable via la variable UPLOADS_DIR.
"""
import os
from pathlib import Path

UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", "uploads"))


def ensure_uploads_dir() -> Path:
    """Crée le dossier d'uploads s'il n'existe pas (idempotent)."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOADS_DIR
