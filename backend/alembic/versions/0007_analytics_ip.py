"""Analytics : IP du client sur les events (pour exclure ses propres visites).

L'IP est captée côté serveur (X-Forwarded-For) et sert uniquement à filtrer
les visites du propriétaire dans le dashboard admin (cf. ANALYTICS_EXCLUDE_IPS).

Revision ID: 0007_analytics_ip
Revises: 0006_i18n_es
Create Date: 2026-06-22
"""
from alembic import op

revision: str = "0007_analytics_ip"
down_revision: str | None = "0006_i18n_es"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50)")


def downgrade() -> None:
    op.execute("ALTER TABLE analytics_events DROP COLUMN IF EXISTS ip_address")
