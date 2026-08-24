"""Compétences Data Engineering : dbt + Snowflake.

Contenu, pas schéma : la base de prod a été semée une seule fois (le seed
TRUNCATE, donc on ne le rejoue pas — il effacerait les témoignages reçus).
Insertion idempotente pour que les deux compétences arrivent au prochain
`alembic upgrade head`. Les libellés EN/ES reprennent la sous-catégorie déjà
traduite ; les noms (dbt, Snowflake) ne se traduisent pas.

Revision ID: 0011_skills_data_eng
Revises: 0010_testimonials_i18n
Create Date: 2026-08-24
"""
from alembic import op

revision: str = "0011_skills_data_eng"
down_revision: str | None = "0010_testimonials_i18n"
branch_labels = None
depends_on = None

_NAMES = ("dbt", "Snowflake")


def upgrade() -> None:
    for name in _NAMES:
        op.execute(
            f"""
            INSERT INTO skills (name, category, subcategory, subcategory_en,
                                subcategory_es, proficiency_level, is_primary)
            SELECT '{name}', 'technical', 'Data & Bases de données',
                   'Data & Databases', 'Datos y bases de datos', 4, TRUE
            WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = '{name}')
            """
        )


def downgrade() -> None:
    names = ", ".join(f"'{n}'" for n in _NAMES)
    op.execute(f"DELETE FROM skills WHERE name IN ({names})")
