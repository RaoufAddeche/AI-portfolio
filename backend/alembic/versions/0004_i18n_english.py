"""Contenu bilingue : colonnes anglaises (_en).

Revision ID: 0004_i18n
Revises: 0003_case_studies
Create Date: 2026-06-17
"""
from alembic import op

revision: str = "0004_i18n"
down_revision: str | None = "0003_case_studies"
branch_labels = None
depends_on = None

# (table, colonne, type) — repli sur la version FR si NULL côté API.
_COLS = [
    ("profile", "title_en", "VARCHAR(200)"),
    ("profile", "bio_en", "TEXT"),
    ("profile", "hero_pitch_en", "TEXT"),
    ("profile", "availability_en", "VARCHAR(120)"),
    ("timeline_events", "title_en", "VARCHAR(200)"),
    ("timeline_events", "description_en", "TEXT"),
    ("skills", "subcategory_en", "VARCHAR(100)"),
    ("case_studies", "title_en", "VARCHAR(200)"),
    ("case_studies", "subtitle_en", "VARCHAR(300)"),
    ("case_studies", "summary_en", "TEXT"),
    ("case_studies", "problem_en", "TEXT"),
    ("case_studies", "approach_en", "TEXT"),
    ("case_studies", "results_en", "TEXT[]"),
    ("case_studies", "architecture_en", "JSONB"),
    ("portfolio_items", "short_pitch_en", "TEXT"),
]


def upgrade() -> None:
    for table, col, typ in _COLS:
        op.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {typ}")


def downgrade() -> None:
    for table, col, _ in _COLS:
        op.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS {col}")
