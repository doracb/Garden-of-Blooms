import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';

const Register = () => {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        email: '',
        parola: '',
        confirmaParola: ''
    });
    
    // AI UITAT SĂ DECLARI ACESTE STATE-URI ÎN CODUL TĂU:
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);
    
    // AI UITAT SĂ DECLARI NAVIGATE:
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEroare(''); 
        setLoading(true); 

        // Validare parole
        if (formData.parola !== formData.confirmaParola) {
            setEroare('Parolele nu coincid!');
            setLoading(false);
            return;
        }

        try {
            // Dacă dă eroare 307, șterge ultimul slash din URL-ul de mai jos
            const response = await fetch('http://localhost:8000/api/v1/utilizatori/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    parola: formData.parola,
                    nume: formData.nume,
                    prenume: formData.prenume
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'A apărut o eroare la crearea contului.');
            }

            // Redirecționare către login dacă a avut succes
            navigate('/login'); 

        } catch (err) {
            setEroare(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow-sm p-4" style={{ width: '450px' }}>
                <h3 className="text-center mb-4 text-primary">Creare Cont</h3>

                {eroare && <Alert variant="danger">{eroare}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nume</Form.Label>
                        <Form.Control
                            type="text"
                            name="nume"
                            value={formData.nume}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Prenume</Form.Label>
                        <Form.Control
                            type="text"
                            name="prenume"
                            value={formData.prenume}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Parolă</Form.Label>
                        <Form.Control
                            type="password"
                            name="parola"
                            value={formData.parola}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Confirmare parolă</Form.Label>
                        <Form.Control
                            type="password"
                            name="confirmaParola"
                            value={formData.confirmaParola}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Button
                        variant="secondary"
                        type="submit"
                        className="w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Se procesează...' : 'Creează contul'}
                    </Button>
                </Form>

                <div className="text-center">
                    <span className="text-muted">Ai deja un cont? </span>
                    <Link to="/login" className="text-primary text-decoration-none fw-bold">
                        Autentifică-te
                    </Link>
                </div>
            </Card> 
        </Container>
    );
};

export default Register;