"""Environnement Alembic (synchrone, driver psycopg).

Alembic est synchrone par nature ; on utilise psycopg (pas asyncpg, qui refuse
les scripts multi-commandes). La DSN vient de la config applicative — aucun
secret dans alembic.ini.
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine

from app.config import get_settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Migrations en SQL brut : pas d'autogenerate, donc pas de metadata.
target_metadata = None


def _sync_dsn() -> str:
    return get_settings().dsn.replace("postgresql://", "postgresql+psycopg://", 1)


def run_migrations_offline() -> None:
    context.configure(
        url=_sync_dsn(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(_sync_dsn(), pool_pre_ping=True)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
