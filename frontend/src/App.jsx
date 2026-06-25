import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Badge } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout } from './store/authSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import Catalog from './components/Catalog';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Profil from './components/Profil';
import Diagnostic from './components/Diagnostic';
import ProdusDetalii from './components/ProdusDetalii';
import Favorite from './components/Favorite';
import AdminDashboard from './components/AdminDashboard';
import AdminComenzi from './components/AdminComenzi';
import AdminProduse from './components/AdminProduse';
import QuizRecomandare from './components/QuizRecomandare';

function App() {
  const { items } = useSelector((state) => state.cart);
  const { items: favoriteItems } = useSelector((state) => state.favorite);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const incarcaUtilizator = async () => {
      if (token && !user) {
        try {
          const response = await fetch('http://localhost:8000/api/v1/utilizatori/profil/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.rol === 'administrator') {
              try {
                const adminRes = await fetch(`http://localhost:8000/api/v1/administratori/${userData.id_utilizator}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (adminRes.ok) {
                  const adminData = await adminRes.json();
                  userData.departament = adminData.departament;
                }
              } catch (err) {
                console.error("Nu am putut aduce detaliile departamentului:", err);
              }
            }
            dispatch(setCredentials({ token, user: userData }));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          dispatch(logout());
        }
      }
    };

    incarcaUtilizator();
  }, [token, user, dispatch]);

  const numarProduse = items.reduce((total, item) => total + item.cantitate, 0);

  return (
    <Router>
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to={isAuthenticated && user && user.rol === 'administrator' ? "/admin" : "/"}>
            Garden of Blooms
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">

              {!(isAuthenticated && user && user.rol === 'administrator') && (
                <>
                  <Nav.Link as={Link} to="/">Catalog</Nav.Link>
                  <Nav.Link as={Link} to="/diagnostic">Diagnostic AI</Nav.Link>
                  <Nav.Link as={Link} to="/quiz">Planta perfectă</Nav.Link>
                  <Nav.Link as={Link} to="/favorite" className="d-flex align-items-center gap-2 me-2 text-danger">
                    <FavoriteBorderIcon />
                    <Badge bg="danger" pill>
                      {favoriteItems.length}
                    </Badge>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-2 me-3">
                    Coș
                    <Badge bg="secondary" text="dark" pill>
                      {numarProduse}
                    </Badge>
                  </Nav.Link>
                </>
              )}

              {isAuthenticated && user && user.rol === 'administrator' && (
                <>
                  {(user.departament === 'Management' || user.departament === 'Director') && (
                    <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                  )}
                  {(user.departament === 'Vanzari' || user.departament === 'Director') && (
                    <Nav.Link as={Link} to="/admin/comenzi">Comenzi</Nav.Link>
                  )}
                  {(user.departament === 'Inventar' || user.departament === 'Director') && (
                    <Nav.Link as={Link} to="/admin/produse">Produse</Nav.Link>
                  )}
                </>
              )}

              {isAuthenticated && user ? (
                <Nav.Link as={Link} to="/profil" className="text-secondary fw-bold">
                  {user.departament === 'Director' ? `Director: ${user.prenume}` : `Salut, ${user.prenume}!`}
                </Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/login">
                  Autentificare
                </Nav.Link>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
        <Route path="/quiz" element={<QuizRecomandare />} />
        <Route path="/produs/:id" element={<ProdusDetalii />} />
        <Route path="/favorite" element={<Favorite />} />
        {user && user.rol === 'administrator' && (
          <>
            {(user.departament === 'Management' || user.departament === 'Director') && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
            {(user.departament === 'Vanzari' || user.departament === 'Director') && (
              <Route path="/admin/comenzi" element={<AdminComenzi />} />
            )}
            {(user.departament === 'Inventar' || user.departament === 'Director') && (
              <Route path="/admin/produse" element={<AdminProduse />} />
            )}
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;