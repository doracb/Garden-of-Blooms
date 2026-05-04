from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class UserCreate(BaseModel):
    email: str
    parola: str
    nume: str
    prenume: str

class UserResponse(BaseModel):
    id_utilizator: int
    email: str
    nume: str
    prenume: str
    rol: str

    class Config:
        from_attributes=True

class UserUpdate(BaseModel):
    nume: Optional[str] = None
    prenume: Optional[str] = None
    parola: Optional[str] = None

class AdministratorCreate(BaseModel):
    id_administrator: int
    departament: str
    data_angajare: date

class AdministratorResponse(BaseModel):
    id_administrator: int
    departament: str
    data_angajare: date

    class Config:
        from_attributes=True

class AdministratorUpdate(BaseModel):
    departament: Optional[str] = None

class CategorieCreate(BaseModel):
    nume_categorie: str

class CategorieResponse(BaseModel):
    id_categorie: int
    nume_categorie: str

    class Config:
        from_attributes = True

class CategorieUpdate(BaseModel):
    nume_categorie: Optional[str] = None

class ProdusCreate(BaseModel):
    id_categorie: int
    denumire: str
    descriere: Optional[str] = None
    pret: float
    stoc: Optional[int] = None
    mediu_viata: Optional[str] = None
    frecventa_udare: Optional[str] = None
    necesar_lumina: Optional[str] = None
    dificultate_ingrijire: Optional[str] = None
    toxic_animale: Optional[bool] = None
    toxic_copii: Optional[bool] = None
    avertismente_speciale: Optional[str] = None
    data_adaugare: Optional[date] = None
    poza_url: Optional[str] = None

class ProdusUpdate(BaseModel):
    id_categorie: Optional[int] = None
    denumire: Optional[str] = None
    descriere: Optional[str] = None
    pret: Optional[float] = None
    stoc: Optional[int] = None
    mediu_viata: Optional[str] = None
    frecventa_udare: Optional[str] = None
    necesar_lumina: Optional[str] = None
    dificultate_ingrijire: Optional[str] = None
    toxic_animale: Optional[bool] = None
    toxic_copii: Optional[bool] = None
    avertismente_speciale: Optional[str] = None
    poza_url: Optional[str] = None

class ProdusResponse(ProdusCreate):
    id_produs: int

    class Config:
        from_attributes = True

class DiagnosticCuRecomandareResponse(BaseModel):
    id_diagnostic: int
    poza_url: str
    boala_detectata: str
    procent_incredere: float
    data_analizei: datetime
    
    sfat_ingrijire: str
    produse_sugerate: List[ProdusResponse] = []

    class Config:
        from_attributes = True

class ClientCreate(BaseModel):
    id_client: int
    telefon: Optional[str] = None
    adresa_livrare: Optional[str] = None
    puncte_fidelitate: Optional[int] = 0

class ClientUpdate(BaseModel):
    telefon: Optional[str] = None
    adresa_livrare: Optional[str] = None
    puncte_fidelitate: Optional[int] = None

class ClientResponse(BaseModel):
    id_client: int
    telefon: Optional[str]
    adresa_livrare: Optional[str]
    puncte_fidelitate: int

    class Config:
        from_attributes = True

class DiagnosticAICreate(BaseModel):
    id_client: int
    poza_url: str
    boala_detectata: Optional[str] = None
    procent_incredere: Optional[float] = None

class DiagnosticAIUpdate(BaseModel):
    poza_url: Optional[str] = None
    boala_detectata: Optional[str] = None
    procent_incredere: Optional[float] = None

class DiagnosticAIResponse(BaseModel):
    id_diagnostic: int
    id_client: int
    poza_url: str
    boala_detectata: Optional[str]
    procent_incredere: Optional[float]
    data_analizei: datetime

    class Config:
        from_attributes = True
       
class ComandaCreate(BaseModel):
    id_client: int
    status: Optional[str] = "In procesare"
    total_de_plata: Optional[float] = 0.0

class ComandaUpdate(BaseModel):
    status: Optional[str] = None
    total_de_plata: Optional[float] = None

class ComandaResponse(BaseModel):
    id_comanda: int
    id_client: int
    data_plasarii: datetime
    status: str
    total_de_plata: float

    class Config:
        from_attributes = True

class RandComandaCreate(BaseModel):
    id_comanda: int
    id_produs: int
    cantitate: int
    pret_la_moment: float

class RandComandaUpdate(BaseModel):
    cantitate: Optional[int] = None
    pret_la_moment: Optional[float] = None

class RandComandaResponse(RandComandaCreate):
    id_rand: int

    class Config:
        from_attributes = True