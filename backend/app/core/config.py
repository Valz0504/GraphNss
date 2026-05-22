from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    APP_NAME: str = "GraphNss API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Store CORS origins as a comma-separated string in .env
    # e.g. CORS_ORIGINS=http://localhost:3000,https://example.com
    CORS_ORIGINS_STR: str = "http://localhost:3000"

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS_STR.split(",") if o.strip()]


settings = Settings()
