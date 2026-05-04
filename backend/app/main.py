from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.app.api.v1 import router_rand_comenzi
from backend.app.db.session import engine
import backend.app.models.models as models

from backend.app.api.v1 import (
    router_utilizatori
)
from backend.app.api.v1 import router_administratori, router_categorii, router_clienti, router_comenzi, router_diagnostice, router_produse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Garden of Blooms API")

app.mount("/static", StaticFiles(directory="static"), name="static")
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