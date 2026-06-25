import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { addToCart } from '../store/cartSlice';
import { toggleFavorite } from '../store/favoriteSlice';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Favorite = () => {
    const { items: favoriteItems } = useSelector((state) => state.favorite);
    const dispatch = useDispatch();

    if (favoriteItems.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <FavoriteIcon style={{ fontSize: '80px', color: '#ccc' }} className="mb-3" />
                <h3 className="text-primary fw-bold">Lista ta de favorite este goală</h3>
                <p className="text-muted mb-4">Apasă pe inimioara produselor din catalog pentru a le salva aici.</p>
                <Button as={Link} to="/" variant="primary" size="lg">
                    <ArrowBackIcon fontSize="small" className="me-2" />
                    Întoarce-te la Catalog
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <h2 className="text-primary fw-bold mb-4">
                <FavoriteIcon color="error" className="me-2" />
                Produse Favorite
            </h2>

            <Row xs={1} md={3} lg={4} className="g-4">
                {favoriteItems.map((produs) => (
                    <Col key={produs.id_produs}>
                        <Card className="h-100 shadow-sm border-0 position-relative">
                            {/* Buton pentru a scoate din favorite */}
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
                                title="Șterge din favorite"
                            >
                                <FavoriteIcon color="error" />
                            </div>

                            <Link to={`/produs/${produs.id_produs}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Card.Img
                                    variant="top"
                                    src={`http://localhost:8000${produs.poza_url}`}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column text-center">
                                    <Card.Title className="text-primary fw-bold">{produs.denumire}</Card.Title>
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
                ))}
            </Row>
        </Container>
    );
};

export default Favorite;