"""Avis multilingues : colonnes _en / _es pour les témoignages.

Repli sur le français (colonnes sans suffixe) si NULL, comme pour les autres contenus.

Revision ID: 0010_testimonials_i18n
Revises: 0009_profile_cv_es
Create Date: 2026-07-03
"""
from alembic import op

revision: str = "0010_testimonials_i18n"
down_revision: str | None = "0009_profile_cv_es"
branch_labels = None
depends_on = None

_COLS = [
    ("testimonials", "quote_en", "TEXT"),
    ("testimonials", "quote_es", "TEXT"),
    ("testimonials", "author_title_en", "VARCHAR(200)"),
    ("testimonials", "author_title_es", "VARCHAR(200)"),
]


def upgrade() -> None:
    for table, col, typ in _COLS:
        op.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {typ}")


def downgrade() -> None:
    for table, col, _ in _COLS:
        op.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS {col}")
