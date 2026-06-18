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

    # Protège POST /api/github/sync quand l'API est exposée publiquement.
    # Si défini, l'appel exige l'en-tête X-Sync-Token. Vide = pas de contrôle (dev local).
    sync_token: str | None = None

    # Notification email des messages de contact (via Resend). Si la clé est
    # absente, le message reste enregistré en base mais aucun email n'est envoyé.
    resend_api_key: str | None = None
    contact_notify_to: str = ""  # email de réception (à définir via .env)
    contact_from: str = "Portfolio <onboarding@resend.dev>"

    # Modération des avis : secret pour signer les liens d'approbation (HMAC) et
    # URL publique de l'API (pour construire le lien cliquable dans l'email).
    admin_token: str | None = None
    public_base_url: str = "http://localhost:8000"

    # Le chatbot lit ce CV (PDF) comme base de connaissance, à jour automatiquement.
    # URL interne (réseau Docker) du frontend qui sert le fichier statique.
    cv_url: str = "http://frontend/cv.pdf"

    @property
    def dsn(self) -> str:
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
