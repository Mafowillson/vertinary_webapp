from pathlib import Path
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    UPLOAD_DIR: str = "uploads"
    # "local" today (VPS disk); swap to an S3-compatible backend later via app/core/storage.py.
    STORAGE_BACKEND: str = "local"
    MAX_LESSON_FILE_SIZE_MB: int = 1024  # 1GB — course videos are the largest files we store
    MEDIA_TOKEN_EXPIRE_MINUTES: int = 360  # 6h — long enough to watch/read without re-requesting
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@vertinary.local"
    VERIFICATION_URL_BASE: str = "http://localhost:5173/verify-email"
    PASSWORD_RESET_URL_BASE: str = "http://localhost:3000/reset-password"
    VERIFICATION_RESEND_COOLDOWN_SECONDS: int = 60
    # smtp: send via SMTP (set SMTP_USERNAME / SMTP_PASSWORD). console: log link only (local dev).
    VERIFICATION_EMAIL_MODE: str = "smtp"

    model_config = SettingsConfigDict(
        env_file=_BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("SMTP_PASSWORD", mode="before")
    @classmethod
    def normalize_smtp_password(cls, v: object) -> object:
        if isinstance(v, str) and v.strip():
            return "".join(v.split())
        return v

    @field_validator("DATABASE_URL")
    @classmethod
    def database_must_be_postgresql(cls, v: str) -> str:
        allowed = ("postgresql://", "postgresql+psycopg2://", "postgresql+asyncpg://")
        if not any(v.strip().startswith(p) for p in allowed):
            raise ValueError(
                "DATABASE_URL must be PostgreSQL, e.g. "
                "postgresql://USER:PASSWORD@localhost:5432/vertinary_db "
                "(SQLite is not supported.)"
            )
        return v.strip()
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list."""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS

settings = Settings()

