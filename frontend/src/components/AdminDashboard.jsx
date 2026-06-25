import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import PaidIcon from '@mui/icons-material/Paid'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import PendingIcon from '@mui/icons-material/Pending';

// Am adăugat a 4-a culoare (un roșu stins) pentru comenzile Anulate
const CULORI_STATUS = ['#D2C7B8', '#f4afcc', '#98A869', '#e63946']; 

const AdminDashboard = () => {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    
    // State-uri pentru datele dinamice
    const [dateVanzari, setDateVanzari] = useState([]);
    const [dateComenzi, setDateComenzi] = useState([]);
    const [statistici, setStatistici] = useState({
        vanzariTotale: 0,
        comenziFinalizate: 0,
        deProcesatUrgent: 0
    });

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/comenzi/?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const comenzi = await response.json();

                // 1. Calcul Status Comenzi (Pie Chart & Carduri)
                let inAsteptare = 0, procesate = 0, finalizate = 0, anulate = 0;
                let totalIncasari = 0;

                console.log("Comenzi primite de la backend:", comenzi);

                comenzi.forEach(c => {
                    // Normalizăm statusul: scoatem spațiile de la capete și îl facem litere mici
                    const statusNormalizat = c.status ? c.status.trim().toLowerCase() : '';

                    if (statusNormalizat === 'în așteptare' || statusNormalizat === 'in asteptare') {
                        inAsteptare++;
                    } 
                    else if (statusNormalizat === 'procesată' || statusNormalizat === 'procesata') {
                        procesate++;
                    } 
                    else if (statusNormalizat === 'anulată' || statusNormalizat === 'anulata') {
                        anulate++;
                    } 
                    else if (statusNormalizat === 'finalizată' || statusNormalizat === 'finalizata') {
                        finalizate++;
                        // Ne asigurăm că convertim corect în număr
                        totalIncasari += parseFloat(c.total_de_plata || 0); 
                    }
                });

                setStatistici({
                    vanzariTotale: totalIncasari,
                    comenziFinalizate: finalizate,
                    deProcesatUrgent: inAsteptare
                });

                setDateComenzi([
                    { status: 'În așteptare', numar: inAsteptare },
                    { status: 'Procesată', numar: procesate },
                    { status: 'Finalizată', numar: finalizate },
                    { status: 'Anulată', numar: anulate }
                ].filter(item => item.numar > 0)); // Excludem statusurile cu 0 ca să arate bine Pie Chart-ul

                // 2. Calcul Vânzări pe Ultimele 7 Zile (Bar Chart)
                const zileSaptamana = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
                const istoric = {};
                
                // Inițializăm ultimele 7 zile cu 0 RON
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    istoric[zileSaptamana[d.getDay()]] = 0;
                }

                // Populăm graficul doar cu comenzile din ultimele 7 zile (care nu sunt anulate)
                const dataLimita = new Date();
                dataLimita.setDate(dataLimita.getDate() - 7);

                comenzi.forEach(c => {
                    const dataComanda = new Date(c.data_plasarii);
                    if (c.status !== 'Anulată' && dataComanda >= dataLimita) {
                        const numeZi = zileSaptamana[dataComanda.getDay()];
                        if (istoric[numeZi] !== undefined) {
                            istoric[numeZi] += parseFloat(c.total_de_plata);
                        }
                    }
                });

                // Transformăm obiectul în array pentru componenta Recharts
                const formatChart = Object.keys(istoric).map(zi => ({
                    zi, vanzari: istoric[zi]
                }));
                setDateVanzari(formatChart);
            }
        } catch (error) {
            console.error("Eroare la aducerea datelor pentru dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token]);

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="mt-4 mb-5">
            <h2 className="text-primary fw-bold mb-4">Dashboard Management</h2>
            
            <Row className="mb-4 g-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 bg-primary text-white">
                        <Card.Body className="d-flex align-items-center">
                            <PaidIcon style={{ fontSize: '3rem', opacity: 0.8 }} className="me-3" />
                            <div>
                                <h6 className="mb-1 fw-normal text-uppercase" style={{ letterSpacing: '1px' }}>Vânzări Încasate</h6>
                                <h3 className="mb-0 fw-bold">{statistici.vanzariTotale.toFixed(2)} <small className="fs-6">RON</small></h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 bg-white border-start border-4" style={{ borderColor: '#98A869 !important' }}>
                        <Card.Body className="d-flex align-items-center">
                            <CheckCircleIcon style={{ fontSize: '3rem', color: '#98A869' }} className="me-3" />
                            <div>
                                <h6 className="mb-1 text-muted text-uppercase" style={{ letterSpacing: '1px' }}>Comenzi Finalizate</h6>
                                <h3 className="mb-0 fw-bold text-dark">{statistici.comenziFinalizate}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 bg-white border-start border-4" style={{ borderColor: '#D2C7B8 !important' }}>
                        <Card.Body className="d-flex align-items-center">
                            <PendingIcon style={{ fontSize: '3rem', color: '#D2C7B8' }} className="me-3" />
                            <div>
                                <h6 className="mb-1 text-muted text-uppercase" style={{ letterSpacing: '1px' }}>De procesat urgent</h6>
                                <h3 className="mb-0 fw-bold text-dark">{statistici.deProcesatUrgent}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100 bg-white">
                        <Card.Header className="bg-transparent border-0 pt-4 pb-0 fw-bold text-secondary fs-5">
                            Evoluție Vânzări (Ultimele 7 zile)
                        </Card.Header>
                        <Card.Body style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dateVanzari} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="zi" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="vanzari" name="Vânzări (RON)" fill="#98A869" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100 bg-white">
                        <Card.Header className="bg-transparent border-0 pt-4 pb-0 fw-bold text-secondary fs-5">
                            Distribuție Status Comenzi
                        </Card.Header>
                        <Card.Body style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dateComenzi}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="numar"
                                        nameKey="status"
                                        stroke="none"
                                    >
                                        {dateComenzi.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CULORI_STATUS[index % CULORI_STATUS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;