# syntax=docker/dockerfile:1
# Image officielle uv (uv + Python figés, build reproductible)
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# 1) Couche dépendances (cache tant que le lock ne change pas)
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# 2) Code applicatif
COPY . .

EXPOSE 8000

# Par défaut : applique les migrations puis lance l'API (pas de --reload en prod).
# docker-compose surcharge cette commande ; conservée pour un run autonome.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
