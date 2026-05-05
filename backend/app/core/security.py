from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import models
from app.db.session import get_db
from datetime import datetime, timezone, timedelta
import jwt

SECRET_KEY = "cheie_secreta_sigura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/utilizatori/login")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(password, hashed_password):
    return pwd_context.verify(password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire_time})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt 

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Nu am putut valida credențialele.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesiunea a expirat. Te rugăm să te loghezi din nou.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalid.")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Utilizatorul nu mai există.")
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis! Nu ai permisiuni de administrator.")
    return current_user