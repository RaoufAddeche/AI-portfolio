"""Nom anglais des compétences (pour les intitulés non techniques).

Revision ID: 0005_skill_name_en
Revises: 0004_i18n
Create Date: 2026-06-17
"""
from alembic import op

revision: str = "0005_skill_name_en"
down_revision: str | None = "0004_i18n"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE skills ADD COLUMN IF NOT EXISTS name_en VARCHAR(100)")


def downgrade() -> None:
    op.execute("ALTER TABLE skills DROP COLUMN IF EXISTS name_en")
