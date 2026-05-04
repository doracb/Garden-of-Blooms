from fastapi import APIRouter, Depends, HTTPException, Path
from backend.app.db.session import get_db
from sqlalchemy.orm import Session
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.core import security

router = APIRouter(prefix="/rand_comenzi", tags=["RandComenzi"])

@router.post("/", response_model=schemas.RandComandaResponse)
def create_rand_comanda(
    rand: schemas.RandComandaCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
    ):  
    db_comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == rand.id_comanda).first()
      
    if db_comanda is None:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită.")
    
    if db_comanda.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Nu poți adăuga produse în comanda altui client.")
        
    db_produs = db.query(models.Produs).filter(models.Produs.id_produs == rand.id_produs).first()
    if db_produs is None:
        raise HTTPException(status_code=404, detail="Produsul nu a fost găsit.")
    
    nou_rand = models.RandComanda(**rand.model_dump())
    db.add(nou_rand)
    db.commit()
    db.refresh(nou_rand)
    
    return nou_rand

@router.get("/{id_rand}", response_model=schemas.RandComandaResponse)
def get_rand_comanda(
    id_rand: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_rand = db.query(models.RandComanda).filter(models.RandComanda.id_rand == id_rand).first()
    
    if db_rand is None:
        raise HTTPException(status_code=404, detail="Rândul de comandă nu a fost găsit.")
    
    if db_rand.comanda.id_rand != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    return db_rand

@router.put("/{id_rand}", response_model=schemas.RandComandaResponse)
def update_rand_comanda(
    rand_update: schemas.RandComandaUpdate, 
    id_rand: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_rand = db.query(models.RandComanda).filter(models.RandComanda.id_rand == id_rand).first()
    
    if db_rand is None:
        raise HTTPException(status_code=404, detail="Rândul de comandă nu a fost găsit.")
    
    if db_rand.comanda.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Nu poți modifica produsele din comanda altui client.")
    
    update_data = rand_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rand, key, value)
        
    db.commit()
    db.refresh(db_rand)
    
    return db_rand

@router.delete("/{id_rand}")
def delete_rand_comanda(
    id_rand: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_rand = db.query(models.RandComanda).filter(models.RandComanda.id_rand == id_rand).first()
    
    if db_rand is None:
        raise HTTPException(status_code=404, detail="Rândul de comandă nu a fost găsit.")
    
    if db_rand.comanda.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Nu poți șterge produsele din comanda altui client.")
    
    db.delete(db_rand)
    db.commit()
    
    return {"mesaj": f"Rândul de comandă cu ID-ul {id_rand} a fost șters."}