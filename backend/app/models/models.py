from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date, Numeric, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.db.base import Base

class User(Base):
    __tablename__ = "utilizatori"

    id_utilizator = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    parola = Column(String, nullable=False)
    nume = Column(String, nullable=False)
    prenume = Column(String, nullable=False)
    rol = Column(String, default="client")
    data_creare = Column(DateTime(timezone=True), server_default=func.now())
    profil_administrator = relationship("Administrator", back_populates="cont_utilizator", uselist=False)
    profil_client = relationship("Client", back_populates="cont_utilizator", uselist=False)

class Administrator(Base):
    __tablename__ = "administratori"
    id_administrator = Column(Integer, ForeignKey("utilizatori.id_utilizator", ondelete="CASCADE"), primary_key=True)
    departament = Column(String, nullable=False)
    data_angajare = Column(Date, nullable=False)
    cont_utilizator = relationship("User", back_populates="profil_administrator")

class Categorie(Base):
    __tablename__ = "categorii"
    
    id_categorie = Column(Integer, primary_key=True, index=True)
    nume_categorie = Column(String, nullable=False)
    
    produse = relationship("Produs", back_populates="categorie")

class Produs(Base):
    __tablename__ = "produse"
    
    id_produs = Column(Integer, primary_key=True, index=True)
    id_categorie = Column(Integer, ForeignKey("categorii.id_categorie"))
    denumire = Column(String, nullable=False)
    descriere = Column(String)
    pret = Column(Numeric(10, 2), nullable=False)
    stoc = Column(Integer)
    mediu_viata = Column(String)
    frecventa_udare = Column(String)
    necesar_lumina = Column(String)
    dificultate_ingrijire = Column(String)
    toxic_animale = Column(Boolean)
    toxic_copii = Column(Boolean)
    avertismente_speciale = Column(String)
    data_adaugare = Column(Date)
    poza_url = Column(String, nullable=True)
    
    categorie = relationship("Categorie", back_populates="produse")

class Client(Base):
    __tablename__ = "clienti"
    
    id_client = Column(Integer, ForeignKey("utilizatori.id_utilizator", ondelete="CASCADE"), primary_key=True)
    telefon = Column(String)
    adresa_livrare = Column(String)
    puncte_fidelitate = Column(Integer, default=0)
    
    cont_utilizator = relationship("User", back_populates="profil_client")
    diagnostice = relationship("DiagnosticAI", back_populates="client")
    comenzi = relationship("Comanda", back_populates="client")

class DiagnosticAI(Base):
    __tablename__ = "diagnostice_ai"
    
    id_diagnostic = Column(Integer, primary_key=True, index=True)
    id_client = Column(Integer, ForeignKey("clienti.id_client", ondelete="CASCADE"))
    poza_url = Column(String, nullable=False)
    boala_detectata = Column(String)
    procent_incredere = Column(Numeric(5, 2))
    data_analizei = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="diagnostice")
    
class Comanda(Base):
    __tablename__ = "comenzi"
    
    id_comanda = Column(Integer, primary_key=True, index=True)
    id_client = Column(Integer, ForeignKey("clienti.id_client", ondelete="CASCADE"), nullable=False)
    data_plasarii = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="In procesare")
    total_de_plata = Column(Numeric(10, 2), default=0.0)
    
    client = relationship("Client", back_populates="comenzi")
    randuri = relationship("RandComanda", back_populates="comanda", cascade="all, delete")

class RandComanda(Base):
    __tablename__ = "rand_comenzi"
    
    id_rand = Column(Integer, primary_key=True, index=True)
    id_comanda = Column(Integer, ForeignKey("comenzi.id_comanda", ondelete="CASCADE"), nullable=False)
    id_produs = Column(Integer, ForeignKey("produse.id_produs"), nullable=False)
    cantitate = Column(Integer, nullable=False, default=1)
    pret_la_moment = Column(Numeric(10, 2), nullable=False)
    
    comanda = relationship("Comanda", back_populates="randuri")
    produs = relationship("Produs")