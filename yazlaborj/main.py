import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging

from app.database import engine, get_db, Base
from app.routers import auth, users, listings, applications, evaluations, jury, criteria
from app.config import settings

# Loglama ayarları
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    logger.info("Veritabanı tabloları oluşturuluyor...")
    Base.metadata.create_all(bind=engine)
    logger.info("Veritabanı tabloları başarıyla oluşturuldu.")
except Exception as e:
    logger.error(f"Veritabanı tabloları oluşturulurken hata: {e}")

app = FastAPI(
  title="Academic Personnel Application System API",
  description="API for managing academic personnel applications",
  version="1.0.0"
)

# Configure CORS
origins = [
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8000",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Include routers
try:
    logger.info("Router'lar ekleniyor...")
    app.include_router(auth.router, tags=["Authentication"], prefix="/api")
    app.include_router(users.router, tags=["Users"], prefix="/api/users")
    app.include_router(listings.router, tags=["Listings"], prefix="/api/listings")
    app.include_router(applications.router, tags=["Applications"], prefix="/api/applications")
    app.include_router(evaluations.router, tags=["Evaluations"], prefix="/api/evaluations")
    app.include_router(jury.router, tags=["Jury"], prefix="/api/jury")
    app.include_router(criteria.router, tags=["Criteria"], prefix="/api/criteria")
    app.include_router(jury.router, prefix="/api/jury", tags=["jury"])
    logger.info("Router'lar başarıyla eklendi.")
except Exception as e:
    logger.error(f"Router'lar eklenirken hata: {e}")

@app.get("/api/health", tags=["Health"])
def health_check():
  return {"status": "healthy"}

if __name__ == "__main__":
    logger.info("Uygulama başlatılıyor...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
