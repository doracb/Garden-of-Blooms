import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { setCredentials } from '../store/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');

        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', parola);

            const loginResponse = await fetch('http://localhost:8000/api/v1/utilizatori/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            if (!loginResponse.ok) {
                throw new Error('Email sau parolă incorecte.');
            }

            const tokenData = await loginResponse.json();
            const token = tokenData.access_token;

            const meResponse = await fetch('http://localhost:8000/api/v1/utilizatori/profil/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!meResponse.ok) {
                throw new Error('Nu am putut prelua profilul utilizatorului.');
            }

            const userData = await meResponse.json();

            if (userData.rol === 'administrator') {
                try {
                    const adminResponse = await fetch(`http://localhost:8000/api/v1/administratori/${userData.id_utilizator}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (adminResponse.ok) {
                        const adminData = await adminResponse.json();
                        userData.departament = adminData.departament;
                    }
                } catch (adminErr) {
                    console.error("Nu am putut prelua departamentul:", adminErr);
                }
            }

            dispatch(setCredentials({ token, user: userData }));

            if (userData.rol === 'administrator') {
                if (userData.departament === 'Management' || userData.departament === 'Director') {
                    navigate('/admin');
                } else if (userData.departament === 'Vanzari') {
                    navigate('/admin/comenzi');
                } else if (userData.departament === 'Inventar') {
                    navigate('/admin/produse');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }

        } catch (err) {
            setEroare(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow-sm p-4" style={{ width: '400px' }}>
                <h3 className="text-center mb-4 text-primary">Autentificare</h3>

                {eroare && <Alert variant="danger">{eroare}</Alert>}

                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nume@exemplu.ro"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Parolă</Form.Label>
                        <Form.Control
                            type="password"
                            required
                            value={parola}
                            onChange={(e) => setParola(e.target.value)}
                            placeholder="Introdu parola"
                        />
                    </Form.Group>

                    <Button
                        variant="secondary"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                    >
                        {loading ? 'Se încarcă...' : 'Intră în cont'}
                    </Button>
                </Form>
                <div className="mt-4 text-center">
                    <span className="text-muted">Nu ai un cont? </span>
                    <Link to="/register" className="text-primary text-decoration-none fw-bold">
                        Creează unul aici
                    </Link>
                </div>
            </Card> 
        </Container>
    );
};

export default Login;