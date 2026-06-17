"""Baseline : schéma complet du portfolio (exécute sql/schema.sql).

Revision ID: 0001_baseline
Revises:
Create Date: 2026-06-16
"""
from pathlib import Path

from alembic import op

revision: str = "0001_baseline"
down_revision: str | None = None
branch_labels = None
depends_on = None

# sql/schema.sql vit à côté du backend ; chemin robuste, indépendant du cwd.
_SCHEMA = Path(__file__).resolve().parents[2] / "sql" / "schema.sql"


def upgrade() -> None:
    op.execute(_SCHEMA.read_text(encoding="utf-8"))


def downgrade() -> None:
    # Baseline : on ne détruit pas le schéma complet automatiquement.
    raise NotImplementedError("Downgrade de la baseline non supporté")
