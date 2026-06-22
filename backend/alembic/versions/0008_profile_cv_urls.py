"""Profil : URLs de CV uploadés (FR/EN) pour le bouton de téléchargement.

Permet de gérer le CV depuis l'admin (upload) sans toucher au repo : le Hero
utilise ces URLs si présentes, sinon repli sur le fichier statique (config.js).

Revision ID: 0008_profile_cv_urls
Revises: 0007_analytics_ip
Create Date: 2026-06-22
"""
from alembic import op

revision: str = "0008_profile_cv_urls"
down_revision: str | None = "0007_analytics_ip"
branch_labels = None
depends_on = None

_COLS = [("cv_url_fr", "VARCHAR(500)"), ("cv_url_en", "VARCHAR(500)")]


def upgrade() -> None:
    for col, typ in _COLS:
        op.execute(f"ALTER TABLE profile ADD COLUMN IF NOT EXISTS {col} {typ}")


def downgrade() -> None:
    for col, _ in _COLS:
        op.execute(f"ALTER TABLE profile DROP COLUMN IF EXISTS {col}")
