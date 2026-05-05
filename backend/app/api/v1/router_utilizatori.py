from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.security import OAuth2PasswordRequestForm
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/utilizatori", tags=["Utilizatori"])

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db)
    ):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if db_user:
        raise HTTPException(status_code=400, detail="Adresa de email este deja utilizată de alt cont.")
    
    parola_securizata = security.get_password_hash(user.parola)

    nou_utilizator = models.User(
        email=user.email,
        parola=parola_securizata,
        nume=user.nume,
        prenume=user.prenume
    )
    
    db.add(nou_utilizator)
    db.commit()
    db.refresh(nou_utilizator)
    
    return nou_utilizator

@router.get("/{id_utilizator}", response_model=schemas.UserResponse)
def get_user(
    id_utilizator:int = Path(..., description="ID-ul utilizatorului căutat", gt=0), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    db_user = db.query(models.User).filter(models.User.id_utilizator == id_utilizator).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
    
    if db_user.id_utilizator != current_user.id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    return db_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.parola):
        raise HTTPException(status_code=400, detail="Email sau parolă incorecte.")

    access_token = security.create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.put("/{id_utilizator}", response_model=schemas.UserResponse)
def update_user(
    user_update: schemas.UserUpdate,
    id_utilizator: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    if current_user.id_utilizator != id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")
    
    db_user = db.query(models.User).filter(models.User.id_utilizator == id_utilizator).first()
    
    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")

    if user_update.nume is not None:
        db_user.nume = user_update.nume
    if user_update.prenume is not None:
        db_user.prenume = user_update.prenume
    if user_update.parola is not None:
        db_user.parola = user_update.parola

    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.delete("/{id_utilizator}")
def delete_user(
    id_utilizator: int = Path(..., gt=0),
    db: Session=Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
    ):
    if current_user.id_utilizator != id_utilizator and current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!    ")
    
    db_user = db.query(models.User).filter(models.User.id_utilizator == id_utilizator).first()

    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")
    
    db.delete(db_user)
    db.commit()

    return {"mesaj":f"Utilizatorul cu ID-ul {id_utilizator} a fost șters."}