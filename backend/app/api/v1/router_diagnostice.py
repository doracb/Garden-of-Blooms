from fastapi import APIRouter, Depends, HTTPException, Path, UploadFile, File, Query
from typing import Optional, List
from app.db.session import get_db
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
import os
from app.models import models
from app.schemas import schemas
from app.core import security
from app.services import serviciu_ai

router = APIRouter(prefix="/diagnostice", tags=["Diagnostice"])

@router.post("/", response_model=schemas.DiagnosticAIResponse)
def create_diagnostic(
    poza: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    if not current_user.profil_client:
        raise HTTPException(status_code=403, detail="Doar clienții înregistrați au access.")
    
    if not poza.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Fișierul încărcat trebuie să fie o imagine.")
    
    os.makedirs("static/imagini_diagnostice", exist_ok=True)
    extensie = poza.filename.split(".")[-1]
    nume_fisier = f"{uuid4().hex}.{extensie}"
    cale_relativa = f"static/imagini_diagnostice/{nume_fisier}"
    
    continut_poza = poza.file.read()
    with open(cale_relativa, "wb") as f:
        f.write(continut_poza)
        
    boala_detectata, procent_incredere = serviciu_ai.analizeaza_frunza(continut_poza)
    
    detalii_boala = serviciu_ai.RECOMANDARI_BOLI.get(boala_detectata, {
    "recomandare": "Contactați un specialist pentru o analiză detaliată.",
    "produs_cautat": ""
    })
    
    produse_recomandate = []
    if detalii_boala["produs_cautat"]:
        produse_recomandate = db.query(models.Produs).filter(
            models.Produs.denumire.ilike(f"%{detalii_boala['produs_cautat']}%")
        ).all()
    
    nou_diagnostic = models.DiagnosticAI(
        id_client=current_user.id_utilizator,
        poza_url=f"/{cale_relativa}",
        boala_detectata=boala_detectata,
        procent_incredere=procent_incredere,
    )
    
    db.add(nou_diagnostic)
    db.commit()
    db.refresh(nou_diagnostic)
    
    raspuns_complet = {
        "id_diagnostic": nou_diagnostic.id_diagnostic,
        "poza_url": nou_diagnostic.poza_url,
        "boala_detectata": nou_diagnostic.boala_detectata,
        "procent_incredere": float(nou_diagnostic.procent_incredere),
        "data_analizei": nou_diagnostic.data_analizei,
        "sfat_ingrijire": detalii_boala["recomandare"],
        "produse_sugerate": produse_recomandate
    }
    
    return raspuns_complet

@router.get("/{id_diagnostic}", response_model=schemas.DiagnosticAIResponse)
def get_diagnostic(
    id_diagnostic: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_diagnostic = db.query(models.DiagnosticAI).filter(models.DiagnosticAI.id_diagnostic == id_diagnostic).first()
    
    if db_diagnostic is None:
        raise HTTPException(status_code=404, detail="Diagnosticul nu a fost găsit.")
    
    if db_diagnostic.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    return db_diagnostic

@router.get("/", response_model=List[schemas.DiagnosticAIResponse])
def get_toate_diagnosticele(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
    data_min: Optional[datetime] = Query(None),
    data_max: Optional[datetime] = Query(None),
    boala: Optional[str] = Query(None),
    incredere_minima: Optional[float] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
    ):
    query = db.query(models.DiagnosticAI)
    
    if current_user.rol != "administrator":
        query = query.filter(models.DiagnosticAI.id_client == current_user.id_utilizator)
    
    if boala:
        query = query.filter(models.DiagnosticAI.boala_detectata.ilike(f"%{boala}%"))
        
    if incredere_minima is not None:
        query = query.filter(models.DiagnosticAI.procent_incredere >= incredere_minima)
    
    if data_min is not None:
        query = query.filter(models.DiagnosticAI.data_analizei >= data_min)
        
    if data_max is not None:
        query = query.filter(models.DiagnosticAI.data_analizei <= data_max)
    
    diagnostice_filtrate = query.offset(offset).limit(limit).all()
    
    return diagnostice_filtrate

@router.put("/{id_diagnostic}", response_model=schemas.DiagnosticAIResponse)
def update_diagnostic(
    diagnostic_update: schemas.DiagnosticAIUpdate, 
    id_diagnostic: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_diagnostic = db.query(models.DiagnosticAI).filter(models.DiagnosticAI.id_diagnostic == id_diagnostic).first()
    
    if db_diagnostic is None:
        raise HTTPException(status_code=404, detail="Diagnosticul nu a fost găsit.")
    
    if db_diagnostic.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    update_data = diagnostic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_diagnostic, key, value)
        
    db.commit()
    db.refresh(db_diagnostic)
    
    return db_diagnostic

@router.delete("/{id_diagnostic}")
def delete_diagnostic(
    id_diagnostic: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_diagnostic = db.query(models.DiagnosticAI).filter(models.DiagnosticAI.id_diagnostic == id_diagnostic).first()
    
    if db_diagnostic is None:
        raise HTTPException(status_code=404, detail="Diagnosticul nu a fost găsit.")
    
    if db_diagnostic.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    cale_poza = db_diagnostic.poza_url.lstrip("/")
    if os.path.exists(cale_poza):
        os.remove(cale_poza)
    
    db.delete(db_diagnostic)
    db.commit()
    
    return {"mesaj": f"Diagnosticul cu ID-ul {id_diagnostic} a fost șters."}