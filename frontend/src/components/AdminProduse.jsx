import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Spinner, Badge, Modal, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminProduse = () => {
    const [produse, setProduse] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state) => state.auth);

    // State-uri pentru Ștergere
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [produsDeSters, setProdusDeSters] = useState(null);

    // State-uri pentru Editare
    const [showEditModal, setShowEditModal] = useState(false);
    const [produsCurent, setProdusCurent] = useState({
        id_produs: '',
        denumire: '',
        pret: '',
        stoc: '',
        mediu_viata: 'Interior'
    });

    const fetchProduse = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/produse?limit=100');
            if (response.ok) {
                const data = await response.json();
                setProduse(data);
            }
        } catch (error) {
            console.error("Eroare la aducerea produselor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduse();
    }, []);

    // --- LOGICĂ EDITARE ---
    const deschideModalEditare = (produs) => {
        setProdusCurent(produs);
        setShowEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProdusCurent(prev => ({ ...prev, [name]: value }));
    };

    const salveazaModificari = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/v1/produse/${produsCurent.id_produs}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    denumire: produsCurent.denumire,
                    pret: parseFloat(produsCurent.pret),
                    stoc: parseInt(produsCurent.stoc),
                    mediu_viata: produsCurent.mediu_viata
                })
            });

            if (response.ok) {
                setProduse(prev => prev.map(p => p.id_produs === produsCurent.id_produs ? produsCurent : p));
                setShowEditModal(false);
            } else {
                const err = await response.json();
                alert(`Eroare la salvare: ${err.detail || "Verifică datele introduse."}`);
            }
        } catch (error) {
            console.error("Eroare:", error);
        }
    };

    // --- LOGICĂ ȘTERGERE ---
    const deschideModalStergere = (produs) => {
        setProdusDeSters(produs);
        setShowDeleteModal(true);
    };

    const confirmaStergerea = async () => {
        if (!produsDeSters) return;
        try {
            const response = await fetch(`http://localhost:8000/api/v1/produse/${produsDeSters.id_produs}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setProduse(prev => prev.filter(p => p.id_produs !== produsDeSters.id_produs));
                setShowDeleteModal(false);
                setProdusDeSters(null);
            }
        } catch (error) {
            console.error("Eroare la ștergere:", error);
        }
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary fw-bold mb-0 d-flex align-items-center">
                    <InventoryIcon fontSize="large" className="me-2" />
                    Inventar Produse
                </h2>
                {/* Butonul de Adăugare a fost eliminat de aici */}
            </div>

            <Card className="shadow-sm border-0 bg-white">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-secondary" style={{ borderBottom: '2px solid #eee' }}>
                            <tr>
                                <th className="py-3 px-4 fw-bold">Imagine</th>
                                <th className="fw-bold">Denumire Produs</th>
                                <th className="fw-bold">Preț</th>
                                <th className="fw-bold">Stoc Disponibil</th>
                                <th className="px-4 fw-bold text-center">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produse.map(produs => (
                                <tr key={produs.id_produs}>
                                    <td className="px-4">
                                        <img
                                            src={produs.poza_url ? `http://localhost:8000${produs.poza_url}` : "https://via.placeholder.com/50"}
                                            alt={produs.denumire}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                            className="shadow-sm border"
                                        />
                                    </td>
                                    <td className="fw-bold text-dark">{produs.denumire}</td>
                                    <td className="text-muted">{produs.pret} RON</td>
                                    <td>
                                        <span className={`fw-bold ${produs.stoc < 5 ? 'text-danger' : 'text'}`}>
                                            {produs.stoc} buc.
                                        </span>
                                        {produs.stoc < 5 && <Badge bg="danger" className="ms-2">Stoc Critic</Badge>}
                                    </td>
                                    <td className="px-4 text-center">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2 rounded-circle p-2 border-0"
                                            title="Editează"
                                            onClick={() => deschideModalEditare(produs)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="rounded-circle p-2 border-0"
                                            title="Șterge"
                                            onClick={() => deschideModalStergere(produs)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* MODAL EDITARE PRODUS */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Form onSubmit={salveazaModificari}>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-primary fw-bold">Modifică Produs</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Denumire Produs</Form.Label>
                            <Form.Control
                                type="text"
                                name="denumire"
                                value={produsCurent.denumire}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Preț (RON)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="pret"
                                value={produsCurent.pret}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Stoc Disponibil</Form.Label>
                            <Form.Control
                                type="number"
                                name="stoc"
                                value={produsCurent.stoc}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowEditModal(false)}>Anulează</Button>
                        <Button variant="primary" type="submit">Salvează modificările</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* MODAL ȘTERGERE PRODUS */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-danger fw-bold">Confirmare Ștergere</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Ești sigur că vrei să ștergi produsul <span className="fw-bold">{produsDeSters?.denumire}</span>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowDeleteModal(false)}>Anulează</Button>
                    <Button variant="danger" onClick={confirmaStergerea}>Da, șterge produsul</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default AdminProduse;