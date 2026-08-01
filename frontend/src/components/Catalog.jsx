import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { addToCart } from '../store/cartSlice';
import { toggleFavorite } from '../store/favoriteSlice';
import { Link, useSearchParams } from 'react-router-dom';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Catalog = () => {
    const dispatch = useDispatch();
    const favoriteItems = useSelector((state) => state.favorite?.items || []);

    const [searchParams, setSearchParams] = useSearchParams();

    const [produse, setProduse] = useState([]);
    const [categorii, setCategorii] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagina, setPagina] = useState(Number(searchParams.get('pagina')) || 1);

    const [filtre, setFiltre] = useState({
        cautare: searchParams.get('cautare') || '',
        id_categorie: searchParams.get('id_categorie') || '',
        pret_min: searchParams.get('pret_min') || '',
        pret_max: searchParams.get('pret_max') || '',
        sigure_animale: searchParams.get('sigure_animale') === 'true',
        sigure_copii: searchParams.get('sigure_copii') === 'true',
        adaugate_recent: searchParams.get('adaugate_recent') === 'true'
    });

    const fetchCategorii = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/categorii');
            if (response.ok) {
                const data = await response.json();
                setCategorii(data);
            }
        } catch (error) {
            console.error("Eroare la preluarea categoriilor:", error);
        }
    };

    const fetchProduse = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtre.cautare) params.append('cautare', filtre.cautare);
            if (filtre.id_categorie) params.append('id_categorie', filtre.id_categorie);
            if (filtre.pret_min) params.append('pret_min', filtre.pret_min);
            if (filtre.pret_max) params.append('pret_max', filtre.pret_max);
            if (filtre.sigure_animale) params.append('toxic_animale', 'false');
            if (filtre.sigure_copii) params.append('toxic_copii', 'false');
            if (filtre.adaugate_recent) params.append('adaugate_recent', true);
            params.append('limit', 9);
            params.append('offset', (pagina - 1) * 9);

            const response = await fetch(`http://localhost:8000/api/v1/produse?${params.toString()}`);
            const data = await response.json();
            setProduse(data);
        } catch (error) {
            console.error("Eroare la preluarea produselor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorii();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams();
        if (filtre.cautare) urlParams.set('cautare', filtre.cautare);
        if (filtre.id_categorie) urlParams.set('id_categorie', filtre.id_categorie);
        if (filtre.pret_min) urlParams.set('pret_min', filtre.pret_min);
        if (filtre.pret_max) urlParams.set('pret_max', filtre.pret_max);
        if (filtre.sigure_animale) urlParams.set('sigure_animale', 'true');
        if (filtre.sigure_copii) urlParams.set('sigure_copii', 'true');
        if (filtre.adaugate_recent) urlParams.set('adaugate_recent', 'true');
        urlParams.set('pagina', pagina);

        setSearchParams(urlParams, { replace: true });

        fetchProduse();
    }, [filtre, pagina]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltre(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setPagina(1);
    };

    return (
        <div className="container mt-4">
            <Row>
                <Col md={3} className="mb-4">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="mb-3">Filtrează Produsele</h5>

                            <Form.Group className="mb-3">
                                <Form.Label>Caută produs</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cautare"
                                    placeholder="ex: Monstera"
                                    value={filtre.cautare}
                                    onChange={handleFilterChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Categorie</Form.Label>
                                <Form.Select
                                    name="id_categorie"
                                    value={filtre.id_categorie}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Toate categoriile</option>
                                    {categorii.map((cat) => (
                                        <option key={cat.id_categorie} value={cat.id_categorie}>
                                            {cat.nume_categorie}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Label>Preț minim</Form.Label>
                                    <Form.Control type="number" name="pret_min" value={filtre.pret_min} onChange={handleFilterChange} />
                                </Col>
                                <Col>
                                    <Form.Label>Preț maxim</Form.Label>
                                    <Form.Control type="number" name="pret_max" value={filtre.pret_max} onChange={handleFilterChange} />
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Sigure pentru animale (Pet-friendly)"
                                    name="sigure_animale"
                                    checked={filtre.sigure_animale}
                                    onChange={handleFilterChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Sigure pentru copii"
                                    name="sigure_copii"
                                    checked={filtre.sigure_copii}
                                    onChange={handleFilterChange}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Adăugate recent"
                                    name="adaugate_recent"
                                    checked={filtre.adaugate_recent}
                                    onChange={handleFilterChange}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    {loading ? (
                        <div className="d-flex justify-content-center mt-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : produse.length === 0 ? (
                        <h4 className="text-muted text-center mt-5">Nu am găsit produse conform filtrelor selectate.</h4>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {produse.map((produs) => {
                                const isFavorite = favoriteItems.some(item => item.id_produs === produs.id_produs);

                                return (
                                    <Col key={produs.id_produs}>
                                        <Card className="h-100 shadow-sm border-0 position-relative">
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    right: '10px',
                                                    zIndex: 2,
                                                    cursor: 'pointer',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    borderRadius: '50%',
                                                    padding: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                onClick={() => dispatch(toggleFavorite(produs))}
                                            >
                                                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="action" />}
                                            </div>

                                            <Link to={`/produs/${produs.id_produs}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                <Card.Img
                                                    variant="top"
                                                    src={produs.poza_url ? `http://localhost:8000${produs.poza_url}` : "https://via.placeholder.com/300x300?text=Fara+Imagine"}
                                                    style={{ height: '250px', objectFit: 'cover' }}
                                                />
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title>{produs.denumire}</Card.Title>
                                                    <Card.Text className="text-muted mb-4 text-truncate">
                                                        {produs.descriere}
                                                    </Card.Text>

                                                    <div className='mt-auto'>
                                                        <h5 className="mb-0 text-secondary fw-bold mb-3">{produs.pret} RON</h5>
                                                    </div>
                                                </Card.Body>
                                            </Link>

                                            <div className="px-3 pb-3">
                                                <Button
                                                    variant='primary'
                                                    onClick={() => dispatch(addToCart({
                                                        id_produs: produs.id_produs,
                                                        denumire: produs.denumire,
                                                        pret: produs.pret,
                                                        poza_url: produs.poza_url
                                                    }))}
                                                    className='w-100'
                                                >
                                                    Adaugă în coș
                                                </Button>
                                            </div>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mt-5 my-4">
                <Button
                    variant="outline-primary"
                    onClick={() => setPagina(prev => prev - 1)}
                    disabled={pagina === 1}
                >
                    &laquo; Pagina anterioară
                </Button>

                <span className="text-muted fw-bold">
                    Pagina {pagina}
                </span>

                <Button
                    variant="outline-primary"
                    onClick={() => setPagina(prev => prev + 1)}
                    disabled={produse.length < 9}
                >
                    Pagina următoare &raquo;
                </Button>
            </div>
        </div>
    );
};

export default Catalog;