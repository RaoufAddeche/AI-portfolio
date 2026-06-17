"""Table des études de cas (projets phares racontés en profondeur).

Revision ID: 0003_case_studies
Revises: 0002_category
Create Date: 2026-06-17
"""
from alembic import op

revision: str = "0003_case_studies"
down_revision: str | None = "0002_category"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS case_studies (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(120) UNIQUE NOT NULL,
            title VARCHAR(200) NOT NULL,
            subtitle VARCHAR(300),
            company VARCHAR(120),
            role VARCHAR(120),
            period VARCHAR(80),
            summary TEXT NOT NULL,
            problem TEXT,
            approach TEXT,
            architecture JSONB DEFAULT '[]',  -- [{step, tech}] : pipeline / schéma
            stack TEXT[] DEFAULT '{}',
            results TEXT[] DEFAULT '{}',
            tags TEXT[] DEFAULT '{}',
            is_published BOOLEAN DEFAULT TRUE,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS case_studies")
