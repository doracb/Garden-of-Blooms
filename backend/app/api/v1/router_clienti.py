from fastapi import APIRouter, Depends, HTTPException, Path
from backend.app.db.session import get_db
from sqlalchemy.orm import Session
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.core import security

router = APIRouter(prefix="/clienti", tags=["Clienti"])

@router.post("/", response_model=schemas.ClientResponse)
def create_client(
    client: schemas.ClientCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    if client.id_client != current_user.id_utilizator:
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    db_user = db.query(models.User).filter(models.User.id_utilizator == client.id_client).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există.")
    if db_user.profil_client:
        raise HTTPException(status_code=400, detail="Acest utilizator este deja client.")
    
    nou_client = models.Client(**client.model_dump())
    db.add(nou_client)
    db.commit()
    db.refresh(nou_client)
    
    return nou_client

@router.get("/{id_client}", response_model=schemas.ClientResponse)
def get_client(
    id_client: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_client = db.query(models.Client).filter(models.Client.id_client == id_client).first()
    
    if db_client is None:
        raise HTTPException(status_code=404, detail="Clientul nu a fost găsit.")
    
    if db_client.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    return db_client

@router.get("/profil/puncte-fidelitate")
def vizualizare_puncte(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    # Ne asigurăm că e client
    if current_user.rol == "administrator":
        raise HTTPException(status_code=403, detail="Administratorii nu au profil de fidelitate.")
    
    # Căutăm profilul de client asociat acestui utilizator
    profil_client = db.query(models.Client).filter(models.Client.id_client == current_user.id_utilizator).first()
    
    if not profil_client:
        raise HTTPException(status_code=404, detail="Profilul de client nu a fost găsit.")
        
    return {
        "nume_complet": current_user.nume,
        "puncte_fidelitate": profil_client.puncte_fidelitate,
        "mesaj": "La fiecare 10 RON cheltuiți, primești 1 punct!"
    }

@router.put("/{id_client}", response_model=schemas.ClientResponse)
def update_client(
    client_update: schemas.ClientUpdate, 
    id_client: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_client = db.query(models.Client).filter(models.Client.id_client == id_client).first()
    
    if db_client is None:
        raise HTTPException(status_code=404, detail="Clientul nu a fost găsit.")
    
    if db_client.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    update_data = client_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
        
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.delete("/{id_client}")
def delete_client(
    id_client: int = Path(..., gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_client = db.query(models.Client).filter(models.Client.id_client == id_client).first()
    
    if db_client is None:
        raise HTTPException(status_code=404, detail="Clientul nu a fost găsit.")
    
    if db_client.id_client != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    db.delete(db_client)
    db.commit()
    
    return {"mesaj": f"Clientul cu ID-ul {id_client} a fost șters."}