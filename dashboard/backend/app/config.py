"""Configuration centralisée, lue depuis l'environnement (aucun secret en dur)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de données
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "portfolio_admin"
    db_password: str  # obligatoire : pas de défaut, pas de fuite
    db_name: str = "portfolio"

    # CORS (origines autorisées du frontend)
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3005",
        "http://localhost:5173",
    ]

    # GitHub (sync des repos)
    github_token: str | None = None
    github_username: str | None = None

    # LLM (résumés de projets à la demande)
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    # Garde-fous du chatbot (anti-spam / protection du budget LLM)
    chat_rate_per_minute: int = 6     # messages max par IP et par minute
    chat_daily_limit: int = 300       # appels LLM max par jour (toutes IP confondues)

    @property
    def dsn(self) -> str:
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
