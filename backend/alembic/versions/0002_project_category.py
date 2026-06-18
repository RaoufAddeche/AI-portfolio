"""Ajoute une catégorie aux projets (filtrage portfolio).

Revision ID: 0002_category
Revises: 0001_baseline
Create Date: 2026-06-17
"""
from alembic import op

revision: str = "0002_category"
down_revision: str | None = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS category VARCHAR(50)")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS chatbot_conversations (
            id BIGSERIAL PRIMARY KEY,
            session_id VARCHAR(100),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS chatbot_conversations")
    op.execute("ALTER TABLE portfolio_items DROP COLUMN IF EXISTS category")
