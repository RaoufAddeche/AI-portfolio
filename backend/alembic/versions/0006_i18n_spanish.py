"""Contenu trilingue : colonnes espagnoles (_es).

Miroir des colonnes _en (migrations 0004/0005). Repli sur le français si NULL.

Revision ID: 0006_i18n_es
Revises: 0005_skill_name_en
Create Date: 2026-06-19
"""
from alembic import op

revision: str = "0006_i18n_es"
down_revision: str | None = "0005_skill_name_en"
branch_labels = None
depends_on = None

# (table, colonne, type) — repli sur la version FR si NULL côté API.
_COLS = [
    ("profile", "title_es", "VARCHAR(200)"),
    ("profile", "bio_es", "TEXT"),
    ("profile", "hero_pitch_es", "TEXT"),
    ("profile", "availability_es", "VARCHAR(120)"),
    ("timeline_events", "title_es", "VARCHAR(200)"),
    ("timeline_events", "description_es", "TEXT"),
    ("skills", "subcategory_es", "VARCHAR(100)"),
    ("skills", "name_es", "VARCHAR(100)"),
    ("case_studies", "title_es", "VARCHAR(200)"),
    ("case_studies", "subtitle_es", "VARCHAR(300)"),
    ("case_studies", "summary_es", "TEXT"),
    ("case_studies", "problem_es", "TEXT"),
    ("case_studies", "approach_es", "TEXT"),
    ("case_studies", "results_es", "TEXT[]"),
    ("case_studies", "architecture_es", "JSONB"),
    ("portfolio_items", "short_pitch_es", "TEXT"),
]


def upgrade() -> None:
    for table, col, typ in _COLS:
        op.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {typ}")


def downgrade() -> None:
    for table, col, _ in _COLS:
        op.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS {col}")
