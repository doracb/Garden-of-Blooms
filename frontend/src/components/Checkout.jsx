import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { clearCart } from '../store/cartSlice';

const Checkout = () => {
    const { items, total } = useSelector((state) => state.cart);
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dateLivrare, setDateLivrare] = useState({
        telefon: '',
        adresa: ''
    });

    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState('');
    const [comandaPlasata, setComandaPlasata] = useState(false);

    useEffect(() => {
        if (user && token) {
            const preiaDateClient = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/api/v1/clienti/${user.id_utilizator}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setDateLivrare({
                            telefon: data.telefon || '',
                            adresa: data.adresa_livrare || ''
                        });
                    }
                } catch (error) {
                    console.error("Nu am putut prelua datele clientului pentru autocompletare", error);
                }
            };

            preiaDateClient();
        }
    }, [user, token]);

    const handleChange = (e) => {
        setDateLivrare({ ...dateLivrare, [e.target.name]: e.target.value });
    };

    const plaseazaComanda = async (e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');

        try {
            const comandaResponse = await fetch('http://localhost:8000/api/v1/comenzi/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id_client: user.id_utilizator,
                    status: "În așteptare",
                    total_de_plata: total
                })
            });

            if (!comandaResponse.ok) throw new Error("Eroare la crearea comenzii");
            const comanda = await comandaResponse.json();

            for (const item of items) {
                await fetch('http://localhost:8000/api/v1/rand_comenzi/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id_comanda: comanda.id_comanda,
                        id_produs: item.id_produs,
                        cantitate: item.cantitate,
                        pret_la_moment: item.pret
                    })
                });
            }

            dispatch(clearCart());
            setComandaPlasata(true);

        } catch (err) {
            console.error(err);
            setEroare('A apărut o problemă la procesarea comenzii. Te rugăm să încerci din nou.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !comandaPlasata) {
        return (
            <div className="container mt-5 text-center">
                <h4>Coșul tău este gol!</h4>
                <Button as={Link} to="/" variant="primary" className="mt-3">
                    Întoarce-te la Catalog
                </Button>
            </div>
        );
    }

    if (comandaPlasata) {
        return (
            <div className="container mt-5 text-center">
                <Alert variant="primary" className="p-5 shadow-sm">
                    <h2 className="mb-4">Comandă plasată cu succes!</h2>
                    <p className="lead">Îți mulțumim pentru comandă. Produsele tale se pregătesc de drum.</p>
                    <Button as={Link} to="/" variant="primary" className="mt-4">
                        Cumpără din nou
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Finalizare Comandă</h2>
            {eroare && <Alert variant="danger">{eroare}</Alert>}

            <Row>
                <Col md={8} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white">Date de livrare</Card.Header>
                        <Card.Body>
                            <Form onSubmit={plaseazaComanda}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Număr de telefon</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="telefon"
                                        required
                                        placeholder="ex: 0712 345 678"
                                        value={dateLivrare.telefon}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Adresă completă</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="adresa"
                                        required
                                        placeholder="Strada, Număr, Bloc, Apartament, Oraș, Județ"
                                        value={dateLivrare.adresa}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Button
                                    variant="secondary"
                                    type="submit"
                                    size="lg"
                                    className="w-100 fw-bold fs-5 text-white"
                                    disabled={loading}
                                >
                                    {loading ? 'Procesare...' : 'Plasează comanda'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm bg-light border-0">
                        <Card.Body>
                            <h5 className="mb-3">Rezumat Comandă</h5>
                            <hr />
                            {items.map((item) => (
                                <div key={item.id_produs} className="d-flex justify-content-between mb-2">
                                    <span>{item.cantitate}x {item.denumire}</span>
                                    <span>{item.pret * item.cantitate} RON</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>TOTAL:</span>
                                <span className="text-secondary">{total} RON</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Checkout;