from fastapi import APIRouter, Depends, HTTPException, Path, Query
from typing import Optional, List
from app.db.session import get_db
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/comenzi", tags=["Comenzi"])

@router.post("/", response_model=schemas.ComandaResponse)
def create_comanda(
    comanda: schemas.ComandaCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    if comanda.id_client != current_user.id_utilizator:
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    db_client = db.query(models.Client).filter(models.Client.id_client == comanda.id_client).first()
    
    if db_client is None:
        raise HTTPException(status_code=404, detail="Clientul nu a fost găsit.")
    
    noua_comanda = models.Comanda(**comanda.model_dump())
    db.add(noua_comanda)
    db.commit()
    db.refresh(noua_comanda)
    
    return noua_comanda

@router.get("/{id_comanda}", response_model=schemas.ComandaResponse)
def get_comanda(
    id_comanda: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == id_comanda).first()
    
    if db_comanda is None:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită.")
    
    if db_comanda.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    return db_comanda

@router.get("/", response_model=List[schemas.ComandaResponse])
def get_toate_comenzile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
    status: Optional[str] = Query(None),
    data_min: Optional[datetime] = Query(None),
    data_max: Optional[datetime] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
    ):
    query = db.query(models.Comanda)
    
    if current_user.rol != "administrator":
        query = query.filter(models.Comanda.id_client == current_user.id_utilizator)
    
    if status:
        query = query.filter(models.Comanda.status == status)
    
    if data_min is not None:
        query = query.filter(models.Comanda.data_plasarii >= data_min)
        
    if data_max is not None:
        query = query.filter(models.Comanda.data_plasarii <= data_max)
    
    comenzi_filtrate = query.offset(offset).limit(limit).all()
    
    return comenzi_filtrate

@router.put("/{id_comanda}", response_model=schemas.ComandaResponse, dependencies=[Depends(security.get_current_admin)])
def update_comanda(
    comanda_update: schemas.ComandaUpdate, 
    id_comanda: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == id_comanda).first()
    
    if db_comanda is None:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită.")
    
    update_data = comanda_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_comanda, key, value)
        
    db.commit()
    db.refresh(db_comanda)
    
    return db_comanda

@router.put("/{id_comanda}/status", response_model=schemas.ComandaResponse)
def actualizeaza_status_comanda(
    id_comanda: int,
    noul_status: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Doar administratorul poate schimba statusul comenzilor.")

    db_comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == id_comanda).first()
    if not db_comanda:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită.")

    db_comanda.status = noul_status
    db.commit()
    db.refresh(db_comanda)

    return db_comanda

@router.delete("/{id_comanda}", dependencies=[Depends(security.get_current_admin)])
def delete_comanda(
    id_comanda: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == id_comanda).first()
    
    if db_comanda is None:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită.")
    
    db.delete(db_comanda)
    db.commit()
    
    return {"mesaj": f"Comanda cu ID-ul {id_comanda} a fost ștearsă."}