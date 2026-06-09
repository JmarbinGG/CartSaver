from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    kroger_client_id: str = ""
    kroger_client_secret: str = ""
    kroger_prod_client_id: str = ""
    kroger_prod_client_secret: str = ""

    model_config = {"env_file": str(Path(__file__).parents[1] / ".env"), "extra": "ignore"}


settings = Settings()
