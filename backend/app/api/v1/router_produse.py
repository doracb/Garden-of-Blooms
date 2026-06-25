from fastapi import APIRouter, Depends, HTTPException, Path, Query
from typing import Optional, List
from app.db.session import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import models
from app.schemas import schemas
from app.core import security
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/produse", tags=["Produse"])

@router.post("/", response_model=schemas.ProdusResponse, dependencies=[Depends(security.get_current_admin)])
def create_produs(
    produs: schemas.ProdusCreate, 
    db: Session = Depends(get_db)
    ):
    db_categorie = db.query(models.Categorie).filter(models.Categorie.id_categorie == produs.id_categorie).first()
    
    if db_categorie is None:
        raise HTTPException(status_code=404, detail="Categoria specificată nu există.")
    
    nou_produs = models.Produs(**produs.model_dump())
    db.add(nou_produs)
    db.commit()
    db.refresh(nou_produs)
    
    return nou_produs

@router.post("/recomandari", response_model=List[schemas.ProdusResponse])
def get_recomandari_quiz(quiz: schemas.QuizRecomandare, db: Session = Depends(get_db)):
    query = db.query(models.Produs).filter(models.Produs.stoc > 0)

    if quiz.are_animale:
        query = query.filter(models.Produs.toxic_animale == False)
    if quiz.are_copii:
        query = query.filter(models.Produs.toxic_copii == False)
    if quiz.mediu_viata and quiz.mediu_viata != "Oricare":
        query = query.filter(
            (models.Produs.mediu_viata == quiz.mediu_viata) | 
            (models.Produs.mediu_viata == "Interior/Exterior")
        )

    if quiz.necesar_lumina and quiz.necesar_lumina != "Nu știu sigur":
        valori_acceptate = []
        if quiz.necesar_lumina == "Scăzut":
            valori_acceptate = ["Semiumbră", "Tolerantă la umbră"]
        elif quiz.necesar_lumina == "Mediu":
            valori_acceptate = ["Lumină indirectă"]
        elif quiz.necesar_lumina == "Ridicat":
            valori_acceptate = ["Soare direct", "Lumină intensă", "Lumină puternică", "Soare parțial"]
            
        if valori_acceptate:
            query = query.filter(models.Produs.necesar_lumina.in_(valori_acceptate))
            
    if quiz.dificultate_ingrijire:
        query = query.filter(models.Produs.dificultate_ingrijire == quiz.dificultate_ingrijire)

    return query.limit(6).all()

@router.get("/{id_produs}", response_model=schemas.ProdusResponse)
def get_produs(
    id_produs: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_produse = db.query(models.Produs).filter(models.Produs.id_produs == id_produs).first()
    
    if db_produse is None:
        raise HTTPException(status_code=404, detail="Produsul nu a fost găsit.")
    
    return db_produse

@router.get("/", response_model=List[schemas.ProdusResponse])
def get_toate_produsele(
    db: Session = Depends(get_db),
    cautare: Optional[str] = Query(None, description="Caută parțial după numele produsului"),
    id_categorie: Optional[int] = Query(None, description="Filtrează după ID-ul categoriei"),
    pret_min: Optional[float] = Query(None, description="Preț minim"),
    pret_max: Optional[float] = Query(None, description="Preț maxim"),
    toxic_animale: Optional[bool] = Query(None, description="Bifează true pentru toxice, false pentru sigure"),
    toxic_copii: Optional[bool] = Query(None, description="Bifează true pentru toxice, false pentru sigure"),
    adaugate_recent: Optional[bool] = Query(False, description="Dacă e true, aduce doar produsele din ultimele 7 zile"),
    offset: int = Query(0, ge=0),
    limit: int = Query(9, le=100)
    ):
    query = db.query(models.Produs)
    if cautare:
        query = query.filter(models.Produs.denumire.ilike(f"%{cautare}%"))
    
    if id_categorie:
        query = query.filter(models.Produs.id_categorie == id_categorie)
        
    if pret_min is not None:
        query = query.filter(models.Produs.pret >= pret_min)
        
    if pret_max is not None:
        query = query.filter(models.Produs.pret <= pret_max)
    
    if toxic_animale is not None:
        query = query.filter(models.Produs.toxic_animale == toxic_animale)
        
    if toxic_copii is not None:
        query = query.filter(models.Produs.toxic_copii == toxic_copii)
    
    if adaugate_recent:
        acum_7_zile = datetime.now() - timedelta(days=7)
        query = query.filter(models.Produs.data_adaugare >= acum_7_zile)
    
    produse_filtrate = query.offset(offset).limit(limit).all()
    
    return produse_filtrate

@router.put("/{id_produs}", response_model=schemas.ProdusResponse, dependencies=[Depends(security.get_current_admin)])
def update_produs(
    produs_update: schemas.ProdusUpdate, 
    id_produs: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_produs = db.query(models.Produs).filter(models.Produs.id_produs == id_produs).first()
    
    if db_produs is None:
        raise HTTPException(status_code=404, detail="Produsul nu a fost găsit.")
    
    update_data = produs_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_produs, key, value)
        
    db.commit()
    db.refresh(db_produs)
    
    return db_produs

@router.delete("/{id_produs}", dependencies=[Depends(security.get_current_admin)])
def delete_produs(
    id_produs: int = Path(..., gt=0), 
    db: Session = Depends(get_db)
    ):
    db_produs = db.query(models.Produs).filter(models.Produs.id_produs == id_produs).first()
    
    if db_produs is None:
        raise HTTPException(status_code=404, detail="Produsul nu a fost găsit.")
    
    try:
        db.delete(db_produs)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, 
            detail="Acest produs nu poate fi șters definitiv deoarece există în istoricul comenzilor clienților. Setați stocul la 0 pentru a-l retrage de la vânzare."
        )
    
    return {"mesaj": f"Produsul cu ID-ul {id_produs} a fost șters cu succes."}