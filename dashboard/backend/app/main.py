"""Point d'entrée FastAPI : assemble la config, le pool DB et les routers."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import close_pool, init_pool
from .routers import (
    analytics,
    exports,
    github,
    modes,
    portfolio,
    profile,
    showcase,
    social,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await init_pool()
    yield
    await close_pool()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Portfolio API",
        description="API du portfolio (PostgreSQL -> FastAPI -> React)",
        version="2.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", tags=["meta"])
    async def root():
        return {"message": "Portfolio API", "version": "2.0.0"}

    @app.get("/health", tags=["meta"])
    async def health():
        """Healthcheck : vérifie l'accès à la base."""
        try:
            async with app.state.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return {"status": "ok", "db": "up"}
        except Exception:  # noqa: BLE001
            return {"status": "degraded", "db": "down"}

    for module in (
        portfolio,
        exports,
        social,
        profile,
        showcase,
        modes,
        analytics,
        github,
    ):
        app.include_router(module.router)

    return app


app = create_app()
