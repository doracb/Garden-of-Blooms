import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { logout } from '../store/authSlice';
import { clearFavorite } from '../store/favoriteSlice';
import { clearCart } from '../store/cartSlice';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

const Profil = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dateClient, setDateClient] = useState({ telefon: '', adresa_livrare: '', puncte_fidelitate: 0 });
  const [esteClient, setEsteClient] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);
  const [mesajDate, setMesajDate] = useState({ tip: '', text: '' });
  const [istoricComenzi, setIstoricComenzi] = useState([]);
  const [istoricDiagnostice, setIstoricDiagnostice] = useState([]);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticSelectat, setDiagnosticSelectat] = useState(null);
  const [parolaNoua, setParolaNoua] = useState('');
  const [loadingParola, setLoadingParola] = useState(false);
  const [mesajParola, setMesajParola] = useState({ tip: '', text: '' });
  const [showModalStergere, setShowModalStergere] = useState(false);
  const [loadingStergere, setLoadingStergere] = useState(false);


  const handleOpenDiagnostic = (diagnostic) => {
    setDiagnosticSelectat(diagnostic);
    setShowDiagnosticModal(true);
  };

  useEffect(() => {
    if (!user) return;

    const fetchDateClient = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/clienti/${user.id_utilizator}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setDateClient({
            telefon: data.telefon || '',
            adresa_livrare: data.adresa_livrare || '',
            puncte_fidelitate: data.puncte_fidelitate || 0
          });
          setEsteClient(true);
          try {
            const comenziResponse = await fetch(`http://localhost:8000/api/v1/comenzi/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (comenziResponse.ok) {
              const comenziData = await comenziResponse.json();

              const comenzileMele = comenziData.filter(c => c.id_client === user.id_utilizator);

              comenzileMele.sort((a, b) => new Date(b.data_plasarii) - new Date(a.data_plasarii));

              setIstoricComenzi(comenzileMele);
            }
          } catch (err) {
            console.error("Nu am putut aduce istoricul comenzilor:", err);
          }
          try {
            const diagResponse = await fetch(`http://localhost:8000/api/v1/diagnostice/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (diagResponse.ok) {
              const diagData = await diagResponse.json();
              setIstoricDiagnostice(diagData);
            }
          } catch (err) {
            console.error("Nu am putut aduce istoricul AI:", err);
          }
        } else if (response.status === 404) {
          setEsteClient(false);
        }
      } catch (err) {
        console.error("Eroare la preluarea datelor:", err);
      }
    };

    fetchDateClient();
  }, [user, token]);

  const handleChangeDate = (e) => {
    setDateClient({ ...dateClient, [e.target.name]: e.target.value });
  };

  const handleSalveazaDate = async (e) => {
    e.preventDefault();
    setLoadingDate(true);
    setMesajDate({ tip: '', text: '' });

    try {
      const method = esteClient ? 'PUT' : 'POST';
      const url = esteClient
        ? `http://localhost:8000/api/v1/clienti/${user.id_utilizator}`
        : `http://localhost:8000/api/v1/clienti/`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_client: user.id_utilizator,
          telefon: dateClient.telefon,
          adresa_livrare: dateClient.adresa_livrare
        })
      });

      if (!response.ok) throw new Error("A apărut o problemă la salvarea datelor.");

      setMesajDate({ tip: 'success', text: 'Datele de livrare au fost actualizate!' });
      setEsteClient(true);
    } catch (err) {
      setMesajDate({ tip: 'danger', text: err.message });
    } finally {
      setLoadingDate(false);
    }
  };

  const handleSchimbaParola = async (e) => {
    e.preventDefault();
    if (parolaNoua.length < 6) {
      setMesajParola({ tip: 'warning', text: 'Parola nouă trebuie să aibă minim 6 caractere.' });
      return;
    }

    setLoadingParola(true);
    setMesajParola({ tip: '', text: '' });

    try {
      const response = await fetch(`http://localhost:8000/api/v1/utilizatori/${user.id_utilizator}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ parola: parolaNoua })
      });

      if (!response.ok) throw new Error("Nu am putut schimba parola.");

      setMesajParola({ tip: 'success', text: 'Parola a fost modificată cu succes!' });
      setParolaNoua('');
    } catch (err) {
      setMesajParola({ tip: 'danger', text: err.message });
    } finally {
      setLoadingParola(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearFavorite());
    dispatch(clearCart());

    dispatch(logout());

    navigate('/');
  };

  const handleStergeCont = async () => {
    setLoadingStergere(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/utilizatori/${user.id_utilizator}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Nu am putut șterge contul.");

      setShowModalStergere(false);
      handleLogout();
    } catch (err) {
      alert("Eroare la ștergerea contului: " + err.message);
      setLoadingStergere(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Te rugăm să te autentifici.</div>;
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8}>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="text-primary fw-bold m-0">Contul tău</h3>
            <Button variant="outline-primary" size="sm" onClick={handleLogout}>
              Deconectare
            </Button>
          </div>

          {esteClient && istoricDiagnostice.length > 0 && (
            <Card className="shadow-sm border-0 mb-4 bg-light">
              <Card.Header className="bg-secondary text-white">Istoric Diagnostice Plante</Card.Header>
              <Card.Body className="p-4">
                <Row>
                  {istoricDiagnostice.map(diag => (
                    <Col md={6} key={diag.id_diagnostic} className="mb-3">
                      <div
                        className="d-flex bg-white p-2 rounded shadow-sm border align-items-center"
                        style={{ cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        onClick={() => handleOpenDiagnostic(diag)}
                      >
                        <img
                          src={`http://localhost:8000${diag.poza_url}`}
                          alt={diag.boala_detectata}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }}
                          className="me-3"
                        />
                        <div>
                          <strong className="d-block text-primary">{diag.boala_detectata.replace(/_/g, ' ')}</strong>
                          <small className="text-muted">{new Date(diag.data_analizei).toLocaleDateString('ro-RO')}</small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}

          {esteClient && istoricComenzi.length > 0 && (
            <Card className="shadow-sm border-0 mb-4 bg-light">
              <Card.Header className="bg-primary text-white">Istoric Comenzi</Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID Comandă</th>
                        <th>Data plasării</th>
                        <th>Status</th>
                        <th>Total de plată</th>
                      </tr>
                    </thead>
                    <tbody>
                      {istoricComenzi.map(comanda => (
                        <tr key={comanda.id_comanda}>
                          <td>#{comanda.id_comanda}</td>
                          <td>{new Date(comanda.data_plasarii).toLocaleDateString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            {/* Colorăm statusul în funcție de starea comenzii */}
                            <span className={`badge ${comanda.status === 'Finalizată' ? 'bg-success' :
                              comanda.status === 'Anulată' ? 'bg-danger' : 'bg-warning text-dark'
                              }`}>
                              {comanda.status}
                            </span>
                          </td>
                          <td className="fw-bold">{comanda.total_de_plata} RON</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          )}

          {esteClient && (
            <Alert variant="secondary" className="mb-4 d-flex align-items-center justify-content-center gap-2 shadow-sm border-0">
              <LocalFloristIcon />
              <span className="fs-5">
                Ai adunat până acum <strong>{dateClient.puncte_fidelitate}</strong> puncte de fidelitate!
              </span>
            </Alert>
          )}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">Date de livrare</Card.Header>
            <Card.Body className="p-4">
              {mesajDate.text && <Alert variant={mesajDate.tip}>{mesajDate.text}</Alert>}

              <Form onSubmit={handleSalveazaDate}>
                <Form.Group className="mb-3">
                  <Form.Label>Număr de telefon</Form.Label>
                  <Form.Control
                    type="tel" name="telefon" value={dateClient.telefon} onChange={handleChangeDate}
                    placeholder="ex: 0712 345 678"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Adresa implicită de livrare</Form.Label>
                  <Form.Control
                    as="textarea" rows={3} name="adresa_livrare" value={dateClient.adresa_livrare} onChange={handleChangeDate}
                    placeholder="Această adresă va fi completată automat la finalizarea comenzilor"
                  />
                </Form.Group>

                <Button variant="secondary" type="submit" disabled={loadingDate}>
                  {loadingDate ? <Spinner size="sm" /> : 'Salvează datele'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light text-dark fw-bold">Securitate cont</Card.Header>
            <Card.Body className="p-4">
              {mesajParola.text && <Alert variant={mesajParola.tip}>{mesajParola.text}</Alert>}

              <Form onSubmit={handleSchimbaParola}>
                <Form.Group className="mb-3">
                  <Form.Label>Setează o nouă parolă</Form.Label>
                  <Form.Control
                    type="password"
                    value={parolaNoua}
                    onChange={(e) => setParolaNoua(e.target.value)}
                    placeholder="Minim 6 caractere"
                  />
                </Form.Group>

                <Button variant="outline-primary" type="submit" disabled={loadingParola}>
                  {loadingParola ? <Spinner size="sm" /> : 'Schimbă parola'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="border border-dark mb-4 shadow-sm">
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Ștergere Cont</h5>
                <p className="text-muted mb-0 small">Atenție! Odată ce îți ștergi contul, datele nu mai pot fi recuperate.</p>
              </div>
              <Button variant="dark" onClick={() => setShowModalStergere(true)}>
                Șterge contul
              </Button>
            </Card.Body>
          </Card>

        </Col>
      </Row>

      <Modal show={showModalStergere} onHide={() => setShowModalStergere(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Confirmare ștergere</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ești sigur că vrei să îți ștergi definitiv contul de pe Garden of Blooms? Această acțiune este ireversibilă.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalStergere(false)}>
            Anulează
          </Button>
          <Button variant="danger" onClick={handleStergeCont} disabled={loadingStergere}>
            {loadingStergere ? 'Se șterge...' : 'Da, șterge contul'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDiagnosticModal} onHide={() => setShowDiagnosticModal(false)} size="lg" centered>
        {diagnosticSelectat && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title className="fw-bold">Istoric Analiză Plantă</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
              <Row>
                <Col sm={8}>
                  <h5 className="text-primary mb-2">
                    Diagnostic: <span className="fw-bold">{diagnosticSelectat.boala_detectata.replace(/_/g, ' ')}</span>
                  </h5>
                  <p className="mb-3 text-muted small">
                    Încredere AI: <strong>{diagnosticSelectat.procent_incredere}%</strong>
                    <br />
                    Data analizei: {new Date(diagnosticSelectat.data_analizei).toLocaleDateString('ro-RO')}
                  </p>
                  <hr />
                  <h6 className="fw-bold text-secondary">Recomandare Tratament:</h6>
                  <p>{diagnosticSelectat.sfat_ingrijire}</p>
                </Col>
                <Col sm={4} className="text-center border-start">
                  <img
                    src={`http://localhost:8000${diagnosticSelectat.poza_url}`}
                    alt="Poza salvată"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '150px', objectFit: 'cover' }}
                  />
                </Col>
              </Row>

              {/* Afișare Produse Sugerate (dacă există în istoricul trimis de backend) */}
              {diagnosticSelectat.produse_sugerate && diagnosticSelectat.produse_sugerate.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-primary mb-3">Produse recomandate din magazin:</h6>
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    {diagnosticSelectat.produse_sugerate.map(produs => (
                      <Card key={produs.id_produs} style={{ width: '11rem' }} className="shadow-sm border-0">
                        <Card.Img variant="top" src={`http://localhost:8000${produs.poza_url}`} style={{ height: '100px', objectFit: 'cover' }} />
                        <Card.Body className="p-2 text-center">
                          <small className="fw-bold d-block text-truncate">{produs.denumire}</small>
                          <small className="text-secondary">{produs.pret} RON</small>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowDiagnosticModal(false)}>
                Închide
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

    </Container>
  );
};

export default Profil;