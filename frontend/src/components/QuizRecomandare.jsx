import React, { useState } from 'react';
import { Container, Card, Button, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReplayIcon from '@mui/icons-material/Replay';
import SpaIcon from '@mui/icons-material/Spa';

const QuizRecomandare = () => {
    const [pas, setPas] = useState(0); 
    const [loading, setLoading] = useState(false);
    const [rezultate, setRezultate] = useState(null);
    
    const [raspunsuri, setRaspunsuri] = useState({
        mediu_viata: '',
        necesar_lumina: '',
        dificultate_ingrijire: '',
        are_animale: false,
        are_copii: false
    });

    const handleSelect = (camp, valoare) => {
        setRaspunsuri(prev => ({ ...prev, [camp]: valoare }));
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setRaspunsuri(prev => ({ ...prev, [name]: checked }));
    };

    const nextStep = () => setPas(prev => prev + 1);

    const submitQuiz = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/produse/recomandari', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(raspunsuri)
            });
            
            if (response.ok) {
                const data = await response.json();
                setRezultate(data);
                setPas(6);
            }
        } catch (error) {
            console.error("Eroare la trimiterea quiz-ului:", error);
        } finally {
            setLoading(false);
        }
    };

    const reseteazaQuiz = () => {
        setRaspunsuri({ mediu_viata: '', necesar_lumina: '', dificultate_ingrijire: '', are_animale: false, are_copii: false });
        setRezultate(null);
        setPas(0);
    };

    return (
        <Container className="mt-5 mb-5 d-flex justify-content-center">
            <Card className="shadow-sm border-0" style={{ maxWidth: '650px', width: '100%', borderRadius: '15px' }}>
                <Card.Body className="p-4 p-md-5 text-center">
 
                    {pas > 0 && pas < 6 && (
                        <div className="mb-4">
                            <Badge bg="primary" className="px-3 py-2 rounded-pill mb-3">
                                Pasul {pas} din 5
                            </Badge>
                        </div>
                    )}

                    {pas === 0 && (
                        <div className="animate__animated animate__fadeIn">
                            <SpaIcon style={{ fontSize: '4rem', color: '#98A869' }} className="mb-3" />
                            <h3 className="fw-bold text-dark mb-4">Găsește planta potrivită pentru tine</h3>
                            <p className="text-muted fs-5 mb-4 text-start" style={{ lineHeight: '1.6' }}>
                                Fiecare locuință este diferită, iar plantele au nevoi specifice pentru a supraviețui. 
                                Dacă nu ești sigur ce să alegi din catalogul nostru, suntem aici să te ajutăm.
                            </p>
                            <p className="text-muted fs-5 mb-5 text-start" style={{ lineHeight: '1.6' }}>
                                Răspunde la câteva întrebări simple despre spațiul tău, timpul liber de care dispui și animalele de companie. 
                                Sistemul nostru va filtra automat produsele pentru a-ți recomanda plantele care se vor dezvolta frumos la tine acasă!
                            </p>
                            <Button 
                                variant="primary" 
                                size="lg" 
                                className="px-5 rounded-pill shadow-sm fw-bold" 
                                onClick={nextStep}
                            >
                                Începe testul <ArrowForwardIcon className="ms-2" fontSize="small" />
                            </Button>
                        </div>
                    )}

                    {pas === 1 && (
                        <div className="animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-dark mb-4">Unde plănuiești să ții noua plantă?</h3>
                            <div className="d-grid gap-3">
                                <Button variant={raspunsuri.mediu_viata === 'Interior' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('mediu_viata', 'Interior')}>În casă / Apartament</Button>
                                <Button variant={raspunsuri.mediu_viata === 'Exterior' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('mediu_viata', 'Exterior')}>Afară (Balcon / Grădină)</Button>
                                <Button variant={raspunsuri.mediu_viata === 'Oricare' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('mediu_viata', 'Oricare')}>Încă nu m-am decis</Button>
                            </div>
                            <Button className="mt-4 px-5 rounded-pill" disabled={!raspunsuri.mediu_viata} onClick={nextStep}>Următorul <ArrowForwardIcon fontSize="small" /></Button>
                        </div>
                    )}

                    {pas === 2 && (
                        <div className="animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-dark mb-4">Câtă lumină naturală pătrunde în acel spațiu?</h3>
                            <div className="d-grid gap-3">
                                <Button variant={raspunsuri.necesar_lumina === 'Scăzut' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('necesar_lumina', 'Scăzut')}>Lumină slabă (colț umbros)</Button>
                                <Button variant={raspunsuri.necesar_lumina === 'Mediu' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('necesar_lumina', 'Mediu')}>Lumină indirectă (cameră normală)</Button>
                                <Button variant={raspunsuri.necesar_lumina === 'Ridicat' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('necesar_lumina', 'Ridicat')}>Soare direct (pe pervaz)</Button>
                                <Button variant={raspunsuri.necesar_lumina === 'Nu știu sigur' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('necesar_lumina', 'Nu știu sigur')}>Nu știu sigur</Button>
                            </div>
                            <Button className="mt-4 px-5 rounded-pill" disabled={!raspunsuri.necesar_lumina} onClick={nextStep}>Următorul <ArrowForwardIcon fontSize="small" /></Button>
                        </div>
                    )}

                    {pas === 3 && (
                        <div className="animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-dark mb-4">Cum te-ai descrie în relația cu plantele?</h3>
                            <div className="d-grid gap-3">
                                <Button variant={raspunsuri.dificultate_ingrijire === 'Ușoară' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('dificultate_ingrijire', 'Ușoară')}>Începător (mai uit să le ud)</Button>
                                <Button variant={raspunsuri.dificultate_ingrijire === 'Medie' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('dificultate_ingrijire', 'Medie')}>Mă descurc onorabil</Button>
                                <Button variant={raspunsuri.dificultate_ingrijire === 'Grea' ? 'primary' : 'outline-primary'} size="lg" onClick={() => handleSelect('dificultate_ingrijire', 'Grea')}>Expert (am o junglă urbană)</Button>
                            </div>
                            <Button className="mt-4 px-5 rounded-pill" disabled={!raspunsuri.dificultate_ingrijire} onClick={nextStep}>Următorul <ArrowForwardIcon fontSize="small" /></Button>
                        </div>
                    )}

                    {pas === 4 && (
                        <div className="animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-dark mb-4">Cerințe de siguranță</h3>
                            <p className="text-muted mb-4">Bifează dacă este cazul. Sistemul va exclude din recomandări plantele cunoscute ca fiind toxice.</p>
                            <Form className="text-start ms-4 ms-md-5 ps-md-4">
                                <Form.Check 
                                    type="checkbox" 
                                    id="check-animale" 
                                    name="are_animale"
                                    label={<span className="fs-5 ms-2">Am animale de companie (câine/pisică)</span>} 
                                    checked={raspunsuri.are_animale}
                                    onChange={handleCheckbox}
                                    className="mb-3 custom-checkbox"
                                />
                                <Form.Check 
                                    type="checkbox" 
                                    id="check-copii" 
                                    name="are_copii"
                                    label={<span className="fs-5 ms-2">Am copii mici</span>} 
                                    checked={raspunsuri.are_copii}
                                    onChange={handleCheckbox}
                                    className="mb-4 custom-checkbox"
                                />
                            </Form>
                            <Button className="mt-2 px-5 rounded-pill" onClick={nextStep}>Următorul <ArrowForwardIcon fontSize="small" /></Button>
                        </div>
                    )}

                    {pas === 5 && (
                        <div className="animate__animated animate__fadeIn">
                            <AutoAwesomeIcon style={{ fontSize: '4rem', color: '#f4afcc' }} className="mb-3" />
                            <h3 className="fw-bold text-dark mb-4">Totul e pregătit!</h3>
                            <p className="text-muted mb-4 fs-5">Am procesat răspunsurile tale. Apasă butonul de mai jos pentru a vedea selecția noastră de plante perfect compatibile cu spațiul și stilul tău de viață.</p>
                            <Button variant="primary" size="lg" className="px-5 rounded-pill shadow-sm fw-bold" onClick={submitQuiz} disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Afișează Recomandările'}
                            </Button>
                        </div>
                    )}

                    {pas === 6 && rezultate && (
                        <div className="animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-primary mb-4">Plantele tale perfecte</h3>
                            {rezultate.length > 0 ? (
                                <Row className="g-4">
                                    {rezultate.map(produs => (
                                        <Col xs={12} sm={6} key={produs.id_produs}>
                                            <Card className="h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                                                <Card.Img variant="top" src={produs.poza_url ? `http://localhost:8000${produs.poza_url}` : "https://via.placeholder.com/150"} style={{ height: '200px', objectFit: 'cover' }} />
                                                <Card.Body className="p-3">
                                                    <h5 className="fw-bold mb-2 text-truncate text-dark">{produs.denumire}</h5>
                                                    <p className="text-primary fw-bold mb-0">{produs.pret} RON</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div className="p-4 bg-light rounded text-muted fs-5">
                                    Din păcate, momentan nu avem în stoc plante care să respecte absolut toate filtrele stricte alese de tine. Încearcă să relaxezi criteriile (de ex. lumina).
                                </div>
                            )}
                            <Button variant="outline-secondary" className="mt-5 px-4 rounded-pill" onClick={reseteazaQuiz}>
                                <ReplayIcon className="me-2" fontSize="small"/> Reîncepe testul
                            </Button>
                        </div>
                    )}

                </Card.Body>
            </Card>
        </Container>
    );
};

export default QuizRecomandare;