"""Pool de connexions asyncpg partagé + dépendance FastAPI.

Un pool unique est créé au démarrage (lifespan) et réutilisé par toutes les
requêtes : bien plus scalable qu'une connexion ouverte/fermée par requête.
"""
import json
from collections.abc import AsyncIterator

import asyncpg
from fastapi import Request

from .config import get_settings

_pool: asyncpg.Pool | None = None


async def _register_json_codecs(conn: asyncpg.Connection) -> None:
    """JSONB/JSON décodés en dict/list (asyncpg renvoie du texte par défaut)."""
    for typename in ("jsonb", "json"):
        await conn.set_type_codec(
            typename, encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
        )


async def init_pool() -> asyncpg.Pool:
    global _pool
    settings = get_settings()
    _pool = await asyncpg.create_pool(
        dsn=settings.dsn,
        min_size=2,
        max_size=10,
        command_timeout=30,
        init=_register_json_codecs,
    )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def get_db(request: Request) -> AsyncIterator[asyncpg.Connection]:
    """Dépendance FastAPI : fournit une connexion empruntée au pool."""
    pool: asyncpg.Pool = request.app.state.pool
    async with pool.acquire() as conn:
        yield conn
