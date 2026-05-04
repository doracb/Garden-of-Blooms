import torch
import torch.nn as nn
from torchvision import models, transforms
import io
from PIL import Image

CLASE_BOLI = [
    "Aloe_Anthracnose",
    "Aloe_Healthy",
    "Aloe_LeafSpot",
    "Aloe_Rust",
    "Aloe_Sunburn",
    "Cactus_Dactylopius",
    "Cactus_Healthy",
    "Money_Plant_Bacterial_wilt_disease",
    "Money_Plant_Healthy",
    "Money_Plant_Manganese_Toxicity",
    "Snake_Plant_Anthracnose",
    "Snake_Plant_Healthy",
    "Snake_Plant_Leaf_Withering",
    "Spider_Plant_Fungal_leaf_spot",
    "Spider_Plant_Healthy",
    "Spider_Plant_Leaf_Tip_Necrosis"
]

RECOMANDARI_BOLI = {
    "Aloe_Anthracnose": {
        "recomandare": "Tăiați părțile afectate folosind o foarfecă dezinfectată și aplicați un tratament antifungic. La udarea plantei, evitați frunzele.",
        "produs_cautat": "Fungicid"
    },
    "Aloe_Healthy": {
        "recomandare": "Planta este perfect sănătoasă! Continuați rutina actuală de îngrijire. Oferiți-i lumină naturală din plin.",
        "produs_cautat": "Îngrășământ"
    },
    "Aloe_LeafSpot": {
        "recomandare": "Îndepărtați frunzele cu pete pentru a opri răspândirea lor. Asigurați o ventilație mai bună în încăpere și utilizați un fungicid.",
        "produs_cautat": "Fungicid"
    },
    "Aloe_Rust": {
        "recomandare": "Rugina este o boală fungică severă. Izolați planta de celelalte și tratați-o urgent cu un fungicid pe bază de cupru sau sulf.",
        "produs_cautat": "Fungicid"
    },
    "Aloe_Sunburn": {
        "recomandare": "Arsură solară. Mutați planta într-o zonă cu lumină indirectă. Zonele deja arse nu se vor reface, dar planta își va reveni cu o nutriție adecvată.",
        "produs_cautat": "Îngrășământ"
    },
    "Cactus_Dactylopius": {
        "recomandare": "Atac de coșenile (păduchi lânioși). Curățați zonele albe cu un bețișor înmuiat în alcool sanitar și aplicați un insecticid specific.",
        "produs_cautat": "Insecticid"
    },
    "Cactus_Healthy": {
        "recomandare": "Cactusul este perfect sănătos! Aveți grijă să nu îl udați excesiv.",
        "produs_cautat": ""
    },
    "Money_Plant_Bacterial_wilt_disease": {
        "recomandare": "Îndepărtați frunzele moi sau negrite, schimbați solul contaminat și aplicați un tratament pe bază de cupru.",
        "produs_cautat": "Substrat" 
    },
    "Money_Plant_Healthy": {
        "recomandare": "Planta este perfect sănătoasă! Mențineți umiditatea aerului la un nivel optim.",
        "produs_cautat": ""
    },
    "Money_Plant_Manganese_Toxicity": {
        "recomandare": "Spălați solul cu apă curată din abundență pentru a elimina sărurile sau replantați în pământ proaspăt.",
        "produs_cautat": "Substrat"
    },
    "Snake_Plant_Anthracnose": {
        "recomandare": "Tăiați frunzele bolnave de la bază pentru a proteja restul plantei. Folosiți un fungicid sistemic și lăsați solul să se usuce complet între udări.",
        "produs_cautat": "Fungicid"
    },
    "Snake_Plant_Healthy": {
        "recomandare": "Planta este perfect sănătoasă! Această specie este foarte rezistentă, evitați doar udarea în exces.",
        "produs_cautat": ""
    },
    "Snake_Plant_Leaf_Withering": {
        "recomandare": "Ofilirea și încrețirea frunzelor indică adesea putregaiul rădăcinilor din cauza excesului de apă. Scoateți planta, verificați rădăcinile și mutați-o într-un sol foarte bine drenat.",
        "produs_cautat": "Substrat"
    },
    "Spider_Plant_Fungal_leaf_spot": {
        "recomandare": "Pentru a evita petele fungice, nu pulverizați apă direct pe frunze și asigurați o bună circulație a aerului. Aplicați un tratament antifungic.",
        "produs_cautat": "Fungicid"
    },
    "Spider_Plant_Healthy": {
        "recomandare": "Planta este perfect sănătoasă! O puteți ajuta să producă mai multe frunze folosind un fertilizant lichid ușor.",
        "produs_cautat": "Îngrășământ"
    },
    "Spider_Plant_Leaf_Tip_Necrosis": {
        "recomandare": "Uscarea vârfurilor este cauzată de lipsa de umiditate în aer sau de sensibilitatea la fluorul din apa de la robinet. Udați cu apă filtrată și pulverizați aerul.",
        "produs_cautat": ""
    }
}

model = models.resnet18(weights=None)

try:
    state_dict = torch.load("app/services/best_plant_model.pth", map_location=torch.device('cpu'))

    numar_clase_antrenate = state_dict['fc.weight'].shape[0]
    
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, numar_clase_antrenate)
    
    model.load_state_dict(state_dict)
    
    model.eval() 
    print(f"Modelul AI a fost încărcat cu succes! S-au detectat {numar_clase_antrenate} clase.")

except Exception as e:
    print(f"Eroare la încărcarea modelului: {e}")

transformari_imagine = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def analizeaza_frunza(imagine_bytes: bytes):
    try:
        imagine = Image.open(io.BytesIO(imagine_bytes)).convert("RGB")
        tensor = transformari_imagine(imagine).unsqueeze(0)

        with torch.no_grad():
            output = model(tensor)
            
            probabilitati = torch.nn.functional.softmax(output[0], dim=0)

            procent_maxim, index_clasa = torch.max(probabilitati, dim=0)
            
        index_castigator = index_clasa.item()

        if index_castigator < len(CLASE_BOLI):
            nume_boala = CLASE_BOLI[index_castigator]
        else:
            nume_boala = f"Boala necunoscută (ID: {index_castigator})"
            
        procentaj = round(procent_maxim.item() * 100, 2)
        
        return nume_boala, procentaj
        
    except Exception as e:
        print(f"Eroare la procesarea pozei: {e}")
        return "Eroare internă", 0.0