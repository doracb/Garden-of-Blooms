import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const Diagnostic = () => {
    const [imagine, setImagine] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rezultat, setRezultat] = useState(null);
    const [eroare, setEroare] = useState('');

    const { token } = useSelector((state) => state.auth);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagine(file);
            setPreview(URL.createObjectURL(file));
            setRezultat(null);
            setEroare('');
        }
    };

    const handleAnalizeaza = async () => {
        if (!imagine) return;

        setLoading(true);
        setEroare('');

        try {
            const formData = new FormData();
            formData.append('poza', imagine);

            const response = await fetch('http://localhost:8000/api/v1/diagnostice', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error("Trebuie să ai profilul de client completat (adresă și telefon) pentru a folosi AI-ul.");
                throw new Error("A apărut o problemă la analiza imaginii.");
            }

            const data = await response.json();
            setRezultat(data);

        } catch (err) {
            setEroare(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 mb-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <div className="text-center mb-4">
                        <h2 className="text-primary fw-bold">Doctorul Plantelor (AI) <LocalFloristIcon fontSize="large" className="text-secondary" /></h2>
                        <p className="text-muted">Încarcă o poză cu frunza bolnavă și lasă inteligența artificială să afle de ce suferă planta ta.</p>
                    </div>

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4 text-center">

                            {eroare && <Alert variant="danger">{eroare}</Alert>}

                            <Form.Group className="mb-4">
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mb-3"
                                />

                                {preview && (
                                    <div className="mb-3">
                                        <img
                                            src={preview}
                                            alt="Preview Planta"
                                            style={{ maxHeight: '300px', objectFit: 'cover', borderRadius: '10px' }}
                                            className="shadow-sm"
                                        />
                                    </div>
                                )}
                            </Form.Group>

                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleAnalizeaza}
                                disabled={!imagine || loading}
                                className="w-100"
                            >
                                {loading ? (
                                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Se analizează...</>
                                ) : (
                                    'Analizează Planta'
                                )}
                            </Button>

                        </Card.Body>
                    </Card>

                    {rezultat && (
                        <Card className="mt-4 shadow-sm border-0 bg-light">
                            <Card.Header className="bg-secondary text-white fw-bold">Rezultatul Analizei</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col sm={8}>
                                        <h5 className="text-primary mb-2">Diagnostic: <span className="fw-bold">{rezultat.boala_detectata.replace(/_/g, ' ')}</span></h5>
                                        <p className="mb-3 text-muted small">
                                            Încredere AI: <strong>{rezultat.procent_incredere}%</strong>
                                        </p>
                                        <hr />
                                        <h6 className="fw-bold text-secondary">Recomandare Tratament:</h6>
                                        <p>{rezultat.sfat_ingrijire}</p>
                                    </Col>
                                    <Col sm={4} className="text-center border-start">
                                        <img
                                            src={`http://localhost:8000${rezultat.poza_url}`}
                                            alt="Poza salvată"
                                            className="img-fluid rounded mb-2 shadow-sm"
                                            style={{ maxHeight: '120px', objectFit: 'cover' }}
                                        />
                                        <small className="d-block text-muted">Imaginea a fost salvată în profilul tău.</small>
                                    </Col>
                                </Row>

                                {rezultat.produse_sugerate && rezultat.produse_sugerate.length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="fw-bold text-primary mb-3">Produse recomandate din magazin:</h6>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {rezultat.produse_sugerate.map(produs => (
                                                <Card key={produs.id_produs} style={{ width: '12rem' }} className="shadow-sm border-0">
                                                    <Card.Img variant="top" src={`http://localhost:8000${produs.poza_url}`} style={{ height: '100px', objectFit: 'cover' }} />
                                                    <Card.Body className="p-2 text-center">
                                                        <small className="fw-bold d-block">{produs.denumire}</small>
                                                        <small className="text-secondary">{produs.pret} RON</small>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}

                </Col>
            </Row>
        </Container>
    );
};

export default Diagnostic;