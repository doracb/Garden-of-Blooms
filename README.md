# ❀ Garden of Blooms ❀

↳ **o aplicație web pentru gestionarea unei florării, dotată cu asistență decizională și diagnosticare a plantelor bolnave cu ajutorul inteligenței artificiale.**

## ✧ Descrierea Proiectului
„Garden of Blooms” este un sistem informatic integrat de tip Full-Stack, dezvoltat cu scopul de a digitaliza și simplifica experiența deținerii plantelor. Arhitectura platformei depășește funcționalitățile clasice ale unui sistem de e-commerce, oferind utilizatorilor nu doar produse fizice, ci și suport informațional avansat. 

Proiectul integrează un sistem inteligent de recomandări bazat pe stilul de viață al consumatorului și un modul inovator de Computer Vision care diagnostichează automat bolile plantelor din fotografii, realizând sugestii de tratament direct din stocul magazinului.

## ✧ Funcționalități Principale

* **E-commerce & Gestiune Clienți:**
  * Explorarea catalogului cu filtre avansate (pe bază de preț, categorie, toxicitate pentru animale/copii).
  * Coș de cumpărături persistent, proces de checkout fluid cu auto-completarea datelor și istoric detaliat al comenzilor.
  * Sistem de fidelizare automatizat care acordă puncte clienților la finalizarea tranzacțiilor.
* **Sistem de Recomandare (Quiz Interactiv):**
  * Consultant digital care preia atributele de mediu ale utilizatorului (lumină, timp, animale de companie) și filtrează algoritmic baza de date pentru a recomanda plantele 100% compatibile, reducând „oboseala decizională”.
* **Diagnosticare AI (Doctorul Plantelor):**
  * Modul de inteligență artificială care analizează imaginile încărcate de clienți pentru a detecta bolile frunzelor.
  * Afișează un diagnostic precis (însoțit de un procent de încredere) și recomandă automat tratamente sau îngrășăminte disponibile în inventarul magazinului (cross-selling).
* **Panou Administrativ (Back-Office):**
  * Sistem securizat (RBAC) pentru gestionarea inventarului (operațiuni CRUD), a comenzilor și a ghidurilor de îngrijire.
  * Tablou de bord (Dashboard) pentru Business Intelligence, ilustrând evoluția vânzărilor și distribuția statusurilor comenzilor.
  * Instrumente de reducere a pierderilor financiare prin aplicarea dinamică a reducerilor de preț pentru stocurile perisabile.

## ✧ Tehnologii Utilizate

Sistemul a fost dezvoltat pe o arhitectură decuplată (Client-Server), comunicând exclusiv prin intermediul unui API RESTful.

* **Frontend:**
  * **Librărie principală:** React.
  * **Managementul stării:** Redux (pentru securizarea token-urilor JWT și starea coșului/favoritelor).
  * **Design & UI:** React-Bootstrap și Material-UI (MUI).
* **Backend:**
  * **Framework:** FastAPI (Python) - ales pentru arhitectura sa asincronă (ASGI) necesară procesării concurente a modelelor AI.
  * **Validare & Securitate:** Pydantic (pentru validarea datelor), JWT (JSON Web Tokens), Passlib/bcrypt (criptare parole).
  * **Interacțiune BD:** SQLAlchemy (ORM).
* **Bază de Date (Persistență & Automatizare):**
  * **SGBD:** PostgreSQL.
  * **Logică internă:** Extindere masivă prin proceduri stocate și triggeri (declanșatoare) scriși în PL/pgSQL pentru sincronizarea tranzacțională a stocurilor, monitorizarea pragurilor critice și fidelizarea clienților.
* **Inteligență Artificială:**
  * **Framework ML:** PyTorch.
  * **Arhitectură Model:** CNN (Rețele Neuronale Convoluționale) tip ResNet-18.
  * **Tehnici aplicate:** Transfer Learning pentru adaptarea la boli vegetale și Data Augmentation (Torchvision) pentru creșterea robusteții vizuale.
