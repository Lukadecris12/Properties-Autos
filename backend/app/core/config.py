import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator

_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
_DEFAULT_DB_FILE = os.path.join(_ROOT_DIR, "propertyhub.db").replace("\\", "/")
_DEFAULT_UPLOAD_DIR = os.path.join(_ROOT_DIR, "uploads").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Properties & Autos"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database URLs
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_DEFAULT_DB_FILE}"
    SYNC_DATABASE_URL: str = f"sqlite:///{_DEFAULT_DB_FILE}"

    # Security
    SECRET_KEY: str = "propertyhub_development_jwt_secret_key_needs_64_bytes_secure_2026_xxyyzz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    # Storage
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = _DEFAULT_UPLOAD_DIR

    # AI Config
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # Resend Email Service
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "PropertyHub <onboarding@resend.dev>"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
