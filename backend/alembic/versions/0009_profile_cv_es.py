"""Profil : URL du CV espagnol (cv_url_es), pour compléter FR/EN.

Le bouton de téléchargement choisit, dans l'ordre : langue courante → EN → FR
(premier CV disponible). Voir le Hero côté frontend.

Revision ID: 0009_profile_cv_es
Revises: 0008_profile_cv_urls
Create Date: 2026-06-22
"""
from alembic import op

revision: str = "0009_profile_cv_es"
down_revision: str | None = "0008_profile_cv_urls"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE profile ADD COLUMN IF NOT EXISTS cv_url_es VARCHAR(500)")


def downgrade() -> None:
    op.execute("ALTER TABLE profile DROP COLUMN IF EXISTS cv_url_es")
