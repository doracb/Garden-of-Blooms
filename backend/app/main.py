import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router_rand_comenzi
from app.db.session import engine
import app.models.models as models

from app.api.v1 import (
    router_utilizatori
)
from app.api.v1 import router_administratori, router_categorii, router_clienti, router_comenzi, router_diagnostice, router_produse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Garden of Blooms API")

origins = [
    "http://localhost:5173",
    "http://localhost:8501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.include_router(router_utilizatori.router, prefix="/api/v1")
app.include_router(router_administratori.router, prefix="/api/v1")
app.include_router(router_clienti.router, prefix="/api/v1")
app.include_router(router_categorii.router, prefix="/api/v1")
app.include_router(router_produse.router, prefix="/api/v1")
app.include_router(router_diagnostice.router, prefix="/api/v1")
app.include_router(router_comenzi.router, prefix="/api/v1")
app.include_router(router_rand_comenzi.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Salutări din backend-ul Python pentru Garden of Blooms!"}