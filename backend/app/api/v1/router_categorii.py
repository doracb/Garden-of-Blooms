from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/categorii", tags=["Categorii"])

@router.post("/", response_model=schemas.CategorieResponse, dependencies=[Depends(security.get_current_admin)])
def create_categorie(
    categorie: schemas.CategorieCreate, 
    db: Session = Depends(get_db)
    ):
    noua_categorie = models.Categorie(**categorie.model_dump())
    
    db.add(noua_categorie)
    db.commit()
    db.refresh(noua_categorie)
    
    return noua_categorie

@router.get("/{id_categorie}", response_model=schemas.CategorieResponse)
def get_categorie(
    id_categorie: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_categorie = db.query(models.Categorie).filter(models.Categorie.id_categorie == id_categorie).first()
    
    if db_categorie is None:
        raise HTTPException(status_code=404, detail="Categoria nu a fost găsită.")
    
    return db_categorie

@router.get("/", response_model=List[schemas.CategorieResponse])
def get_toate_categoriile(db: Session = Depends(get_db)):
    db_categorii = db.query(models.Categorie).all()
    return db_categorii

@router.put("/{id_categorie}", response_model=schemas.CategorieResponse, dependencies=[Depends(security.get_current_admin)])
def update_categorie(
    categorie_update: schemas.CategorieUpdate, 
    id_categorie: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
):
    db_categorie = db.query(models.Categorie).filter(models.Categorie.id_categorie == id_categorie).first()
    
    if db_categorie is None:
        raise HTTPException(status_code=404, detail="Categoria nu a fost găsită.")
    
    if categorie_update.nume_categorie is not None:
        db_categorie.nume_categorie = categorie_update.nume_categorie
        
    db.commit()
    db.refresh(db_categorie)
    
    return db_categorie

@router.delete("/{id_categorie}", dependencies=[Depends(security.get_current_admin)])
def delete_categorie(
    id_categorie: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
):
    db_categorie = db.query(models.Categorie).filter(models.Categorie.id_categorie == id_categorie).first()
    
    if db_categorie is None:
        raise HTTPException(status_code=404, detail="Categoria nu a fost găsită.")
    
    db.delete(db_categorie)
    db.commit()
    
    return {"mesaj": f"Categoria cu ID-ul {id_categorie} a fost ștearsă."}
