from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "COUNCIL"
    debug: bool = False

    # DigitalOcean Gradient AI
    do_model_access_key: str = ""
    do_inference_url: str = "https://inference.do-ai.run/v1"

    # Models
    advisor_model: str = "llama3.3-70b-instruct"
    router_model: str = "llama3.3-70b-instruct"
    synthesis_model: str = "anthropic-claude-4.5-sonnet"

    # Database
    database_url: str = "sqlite+aiosqlite:///./council.db"

    # Session
    max_debate_rounds: int = 2
    max_advisors_per_query: int = 5
    max_tokens_per_response: int = 1024
    synthesis_max_tokens: int = 2048

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


_settings: Settings | None = None

def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
