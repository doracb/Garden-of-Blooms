from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import text
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/administratori", tags=["Administratori"])

@router.post("/", response_model=schemas.AdministratorResponse, dependencies=[Depends(security.get_current_admin)])
def create_administrator(
    administrator: schemas.AdministratorCreate, 
    db: Session = Depends(get_db)
    ):
    db_user = db.query(models.User).filter(models.User.id_utilizator == administrator.id_administrator).first()
    if db_user is None:
        raise HTTPException(status_code=400, detail="Utilizatorul cu acest ID nu există în baza de date.")
    
    if db_user.cont_administrator:
        raise HTTPException(status_code=400, detail="Acest utilizator este deja administrator.")

    nou_administrator = models.Administrator(
        id_administrator=administrator.id_admin,
        departament=administrator.departament,
        data_angajare=administrator.data_angajare
    )
    
    db_user.rol = "administrator"
    db.add(nou_administrator)
    db.commit()
    db.refresh(nou_administrator)
    
    return nou_administrator

@router.post("/dashboard/cleanup-comenzi", tags=["Admin Dashboard"])
def cleanup_comenzi_abandonate(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")

    # Apelăm procedura stocată folosind CALL
    db.execute(text("CALL sterge_comenzi_abandonate()"))
    db.commit() # Important să dăm commit pentru proceduri!

    return {"mesaj": "Procedura de ștergere a comenzilor abandonate a fost executată."}

@router.post("/dashboard/aplica-reduceri", tags=["Admin Dashboard"])
def aplica_reduceri_perisabilitate(
    zile_vechime: int = Query(7, description="Aplică reducere pentru produsele mai vechi de X zile"),
    procent_reducere: float = Query(20.0, description="Procentul reducerii (ex: 20 pentru 20%)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")

    db.execute(
        text("CALL aplica_reduceri_perisabilitate(:zile, :procent)"),
        {"zile": zile_vechime, "procent": procent_reducere}
    )
    db.commit()

    return {"mesaj": f"Reducerile de {procent_reducere}% au fost aplicate pentru produsele în stoc de peste {zile_vechime} zile."}

@router.get("/{id_administrator}", response_model=schemas.AdministratorResponse, dependencies=[Depends(security.get_current_admin)])
def get_administrator(
    id_administrator:int = Path(..., description="ID-ul administratorului căutat", gt=0), 
    db: Session = Depends(get_db)
    ):
    db_administrator = db.query(models.Administrator).filter(models.Administrator.id_administrator == id_administrator).first()

    if db_administrator is None:
        raise HTTPException(status_code=404, detail="Administratorul nu a fost găsit.")
    
    return db_administrator

@router.get("/dashboard/venit-lunar", tags=["Admin Dashboard"])
def get_venit_lunar(
    an: int = Query(..., ge=2024),
    luna: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.rol != "administrator":
        raise HTTPException(status_code=403, detail="Acces interzis!")

    rezultat = db.execute(
        text("SELECT calculeaza_venit_lunar(:an, :luna)"),
        {"an": an, "luna": luna}
    ).scalar()

    return {
        "perioada": f"{luna}/{an}",
        "venit_total": float(rezultat) if rezultat else 0.0,
        "moneda": "RON"
    }

@router.put("/{id_administrator}", response_model=schemas.AdministratorResponse, dependencies=[Depends(security.get_current_admin)])
def update_administrator(
    administrator_update: schemas.AdministratorUpdate,
    id_administrator: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    db_administrator = db.query(models.Administrator).filter(models.Administrator.id_administrator == id_administrator).first()
    
    if db_administrator is None:
        raise HTTPException(status_code=404, detail="Administratorul nu a fost găsit.")

    if administrator_update.departament is not None:
        db_administrator.departament = administrator_update.departament

    db.commit()
    db.refresh(db_administrator)
    
    return db_administrator

@router.delete("/{id_administrator}", dependencies=[Depends(security.get_current_admin)])
def delete_administrator(
    id_administrator: int = Path(..., gt=0),
    db: Session=Depends(get_db)
):
    db_administrator = db.query(models.Administrator).filter(models.Administrator.id_administrator == id_administrator).first()

    if db_administrator is None:
        raise HTTPException(status_code=404, detail="Administratorul nu a fost găsit.")
    
    db.delete(db_administrator)
    db.commit()

    return {"mesaj":f"Administratorul cu ID-ul {id_administrator} a fost șters."}