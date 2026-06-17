# Portfolio Dual-Mode (CDI / Freelance)

Portfolio full-stack qui s'auto-alimente depuis GitHub, génère des résumés de projets
via LLM **à la demande**, et adapte son contenu selon l'audience (recruteur CDI ou client
freelance).

## Stack

| Couche      | Techno                                  | Port |
|-------------|-----------------------------------------|------|
| Frontend    | React 18 + Vite + Tailwind              | 3000 |
| Backend     | FastAPI (package `app/`, pool asyncpg)  | 8000 |
| Base        | PostgreSQL 15                           | 5432 |
| Migrations  | Alembic (SQL brut, driver psycopg)      | —    |
| LLM         | API OpenAI (résumés à la demande)       | —    |

> Historique : ce projet utilisait n8n + Ollama + un sidecar Node (brief école).
> Tout a été retiré au profit d'une stack Python unique, plus légère et déployable
> sur un VPS (3 conteneurs au lieu de 6, aucun LLM tournant en permanence).

## Démarrage rapide

```bash
# 1. Configuration
cp .env.example .env        # puis renseigner les secrets (DB, GitHub, OpenAI)

# 2. Tout démarrer (la DB est migrée automatiquement au boot du backend)
docker compose up -d --build

# 3. Charger les données d'exemple (une seule fois, données perso)
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  < dashboard/backend/sql/seed.sql

# 4. Accès
#   Portfolio : http://localhost:3000
#   API + docs: http://localhost:8000/docs
#   Santé     : http://localhost:8000/health
```

## Développement backend (sans Docker)

Le backend utilise [uv](https://docs.astral.sh/uv/) :

```bash
cd dashboard/backend
uv sync                       # crée .venv et installe depuis uv.lock
uv run alembic upgrade head   # applique le schéma
uv run uvicorn app.main:app --reload
uv run ruff check app/        # lint
```

## Structure backend

```
dashboard/backend/
├── app/
│   ├── main.py            # factory FastAPI + lifespan (pool) + montage routers
│   ├── config.py          # Settings (pydantic-settings, secrets via env)
│   ├── db.py              # pool asyncpg partagé + dépendance get_db
│   ├── models.py          # modèles Pydantic
│   ├── routers/           # endpoints par domaine
│   │   ├── portfolio.py   profile.py   showcase.py   modes.py
│   │   ├── analytics.py   exports.py   social.py     github.py
│   └── services/
│       ├── github.py      # client API GitHub (ex-sidecar Node)
│       └── llm.py         # résumés OpenAI à la demande
├── alembic/               # migrations (baseline = sql/schema.sql)
├── sql/                   # schema.sql (DDL) + seed.sql (données démo)
├── pyproject.toml + uv.lock
└── Dockerfile             # image uv multi-couches
```

## Synchroniser ses repos GitHub

Aucun cron permanent : on appelle l'endpoint quand on veut (manuellement, via un
cron VPS ou une GitHub Action). Les projets arrivent en statut `draft` pour
validation humaine avant publication.

```bash
curl -X POST "http://localhost:8000/api/github/sync?min_stars=0&limit=10"
```

## Sécurité

- Tous les secrets vivent dans `.env` (gitignoré). Aucun secret en dur dans le code.
- Le backend exige `DB_PASSWORD` via l'environnement (pas de valeur par défaut).
