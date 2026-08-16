from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import (
    engine,
    Base,
    ensure_auth_verification_columns,
    ensure_password_reset_columns,
    ensure_preferred_language_column,
    ensure_exchange_rates_column,
)
from app.api.v1 import api_router
import app.models  # noqa: F401 — register SQLAlchemy models with Base.metadata

# Create database tables
Base.metadata.create_all(bind=engine)
ensure_auth_verification_columns()
ensure_password_reset_columns()
ensure_preferred_language_column()
ensure_exchange_rates_column()

app = FastAPI(
    title="Vertinary Website API",
    description="Backend API for L'Académie DES Éleveurs",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Publicly servable uploads (product cover images ONLY — key prefix "covers/").
# Deliberately NOT mounting the whole UPLOAD_DIR: lesson video/audio/pdf files live
# under "products/{id}/..." in the same root and must stay reachable only through
# the token-gated /stream route (see app/api/v1/lessons.py), never served statically.
_covers_dir = Path(settings.UPLOAD_DIR) / "covers"
_covers_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads/covers", StaticFiles(directory=str(_covers_dir)), name="covers")

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Vertinary Website API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

