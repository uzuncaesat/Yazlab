from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # DATABASE_URL alanını geri ekleyelim, ancak ASCII karakterlerle sınırlayalım
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/academic_db"
    
    # Doğrudan bağlantı parametreleri de kalsın
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "academic_db"
    
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Uygulama ayarları
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
