from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from app.config import settings

# Veritabanı bağlantı URL'sini oluştur
# Eğer DATABASE_URL çevre değişkeni varsa onu kullan, yoksa ayarlardan al
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")

# Bağlantı hatası durumunda SQLite'a geri dön
try:
    # PostgreSQL bağlantısını dene
    engine = create_engine(DATABASE_URL)
    # Test bağlantısı yap
    with engine.connect() as conn:
        pass
    print(f"PostgreSQL veritabanına başarıyla bağlandı: {settings.DB_NAME}")
except Exception as e:
    print(f"PostgreSQL bağlantı hatası: {e}")
    print("SQLite veritabanı kullanılıyor...")
    # SQLite kullan (bellek içi)
    engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})

# SessionLocal sınıfını oluştur
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base sınıfını oluştur
Base = declarative_base()

# DB oturumu almak için dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
