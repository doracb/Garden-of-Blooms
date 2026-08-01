import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpaIcon from '@mui/icons-material/Spa';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ProdusDetalii = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [produs, setProdus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/produse/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProdus(data);
        }
      } catch (error) {
        console.error("Eroare la preluarea produsului:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProdus();
  }, [id]);

  const handleAdaugaInCos = () => {
    dispatch(addToCart({
      id_produs: produs.id_produs,
      denumire: produs.denumire,
      pret: produs.pret,
      poza_url: produs.poza_url
    }));
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
  if (!produs) return <Container className="mt-5 text-center"><h3>Produsul nu a fost găsit.</h3></Container>;

  return (
    <Container className="mt-4 mb-5">
      <div 
        onClick={() => navigate(-1)} 
        className="text-secondary mb-3 d-inline-block" 
        style={{ cursor: 'pointer' }}
      >
        <ArrowBackIcon fontSize="small" /> Înapoi
      </div>
      
      <Row className="bg-white p-4 rounded shadow-sm border">
        <Col md={6} className="text-center mb-4 mb-md-0">
          <img 
            src={`http://localhost:8000${produs.poza_url}`} 
            alt={produs.denumire} 
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </Col>

        <Col md={6}>
          <h2 className="text-primary fw-bold mb-2">{produs.denumire}</h2>
          <h3 className="text-secondary mb-3">{produs.pret} RON</h3>
          <p className="text-muted">{produs.descriere}</p>
          
          <Button variant="primary" size="lg" className="w-100 mb-4 fw-bold" onClick={handleAdaugaInCos}>
            Adaugă în Coș
          </Button>

          {/* AICI ESTE MODIFICAREA: Verificăm dacă produsul face parte din categoriile de plante (ID-uri 1, 2, 3) */}
          {[1, 2, 3].includes(produs.id_categorie) && (
            <Card className="border-0 bg-light shadow-sm mb-3">
              <Card.Header className="bg-primary text-white fw-bold">
                <SpaIcon fontSize="small" className="me-2" />
                Instrucțiuni de îngrijire
              </Card.Header>
              <Card.Body>
              <ul className="list-unstyled mb-0">
                  <li className="mb-3">
                    <WaterDropIcon className="text-info me-2" />
                    <strong>Frecvența udării:</strong> {produs.frecventa_udare}
                  </li>
                  <li className="mb-3">
                    <WbSunnyIcon className="text-warning me-2" />
                    <strong>Necesar lumină:</strong> {produs.necesar_lumina}
                  </li>
                  <li className="mb-3">
                    <SpaIcon className="text-success me-2" />
                    <strong>Dificultate:</strong> <Badge bg={produs.dificultate_ingrijire === 'Ușoară' ? 'success' : 'warning'}>{produs.dificultate_ingrijire}</Badge>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          )}

          {/* Avertismentele de toxicitate rămân vizibile pentru toate categoriile (inclusiv fertilizanți) */}
          {(produs.toxic_animale || produs.toxic_copii || produs.avertismente_speciale) && (
            <Card className="border-0 bg-light shadow-sm border-danger">
              <Card.Body className="p-3">
                <div className="text-danger small">
                  <WarningAmberIcon fontSize="small" className="me-1" />
                  <strong>Atenție:</strong> {produs.toxic_animale ? 'Toxic pentru animale. ' : ''} 
                  {produs.toxic_copii ? 'A nu se lăsa la îndemâna copiilor. ' : ''}
                  {produs.avertismente_speciale}
                </div>
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default ProdusDetalii;