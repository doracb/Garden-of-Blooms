import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Badge, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const AdminComenzi = () => {
    const [comenzi, setComenzi] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state) => state.auth);

    const fetchComenzi = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/comenzi/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                data.sort((a, b) => new Date(b.data_plasarii) - new Date(a.data_plasarii));
                setComenzi(data);
            }
        } catch (error) {
            console.error("Eroare la aducerea comenzilor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchComenzi();
    }, [token]);

    const handleStatusChange = async (id_comanda, noulStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/comenzi/${id_comanda}/status?noul_status=${noulStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setComenzi(prevComenzi => 
                    prevComenzi.map(c => c.id_comanda === id_comanda ? { ...c, status: noulStatus } : c)
                );
            } else {
                alert("Eroare la modificarea statusului!");
            }
        } catch (error) {
            console.error("Eroare:", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'În așteptare': 
                return <Badge style={{ backgroundColor: '#D2C7B8', color: '#333' }} className="px-3 py-2 rounded-pill">În așteptare</Badge>;
            case 'Procesată': 
                return <Badge style={{ backgroundColor: '#f4afcc', color: '#fff' }} className="px-3 py-2 rounded-pill">Procesată</Badge>;
            case 'Finalizată': 
                return <Badge style={{ backgroundColor: '#98A869', color: '#fff' }} className="px-3 py-2 rounded-pill">Finalizată</Badge>;
            case 'Anulată':
                return <Badge bg="danger" className="px-3 py-2 rounded-pill">Anulată</Badge>;
            default: 
                return <Badge bg="secondary" className="px-3 py-2 rounded-pill">{status}</Badge>;
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="mt-4 mb-5">
            <h2 className="text-primary fw-bold mb-4 d-flex align-items-center">
                <ReceiptLongIcon fontSize="large" className="me-2" />
                Gestionare Comenzi
            </h2>
            
            <Card className="shadow-sm border-0 bg-white">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-secondary" style={{ borderBottom: '2px solid #eee' }}>
                            <tr>
                                <th className="py-3 px-4 fw-bold"># ID</th>
                                <th className="fw-bold">Data Plasării</th>
                                <th className="fw-bold">ID Client</th>
                                <th className="fw-bold">Total</th>
                                <th className="fw-bold">Status Curent</th>
                                <th className="px-4 fw-bold">Acțiune</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comenzi.map(comanda => (
                                <tr key={comanda.id_comanda}>
                                    <td className="fw-bold px-4 text-muted">#{comanda.id_comanda}</td>
                                    <td className="text-muted">{new Date(comanda.data_plasarii).toLocaleString('ro-RO')}</td>
                                    <td className="text-muted">{comanda.id_client}</td>
                                    <td className="fw-bold text-dark">{comanda.total_de_plata} RON</td>
                                    <td>{getStatusBadge(comanda.status)}</td>
                                    <td className="px-4 py-3">
                                        <Form.Select 
                                            size="sm" 
                                            value={comanda.status}
                                            onChange={(e) => handleStatusChange(comanda.id_comanda, e.target.value)}
                                            style={{ width: '160px', borderColor: '#eee', borderRadius: '8px' }}
                                            className="shadow-none focus-ring-primary"
                                        >
                                            <option value="În așteptare">Treci în: Așteptare</option>
                                            <option value="Procesată">Treci în: Procesată</option>
                                            <option value="Finalizată">Treci în: Finalizată</option>
                                            <option value="Anulată">Anulează Comanda</option>
                                        </Form.Select>
                                    </td>
                                </tr>
                            ))}
                            {comenzi.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Nu există comenzi plasate încă.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminComenzi;