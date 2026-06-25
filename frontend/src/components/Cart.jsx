import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../store/cartSlice";
import { Button, ListGroup, Badge, Card } from "react-bootstrap";

const Cart = () => {
    const { items, total } = useSelector(state => state.cart);
    const dispatch = useDispatch();

    return (
        <Card className="m-3 shadow-sm">
            <Card.Header as="h4" className="bg-primary text-white">
                Coș de cumpărături
            </Card.Header>
            <Card.Body>
                {items.length === 0 ? (
                    <p className="text-muted text-center my-4">Coșul este gol</p>
                ) : (
                    <>
                        <ListGroup variant="flush">
                            {items.map((produs) => (
                                <ListGroup.Item
                                    key={produs.id_produs}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <h6 className="mb-0">{produs.denumire}</h6>
                                        <small className="text-muted">
                                            {produs.pret} RON x {produs.cantitate} buc.
                                        </small>
                                    </div>

                                    <div className="d-flex align-items-center gap-3">
                                        <strong>{produs.pret * produs.cantitate} RON</strong>

                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => dispatch(removeFromCart(produs.id_produs))}
                                        >
                                            Șterge
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <div>
                            <h5>
                                Total: <Badge>{total} RON</Badge>
                            </h5>

                            <div>
                                <Button
                                    variant="outline-secondary"
                                    className="me-2"
                                    onClick={() => dispatch(clearCart())}
                                >
                                    Golește coșul
                                </Button>
                                <Button as={Link} to="/checkout" variant="secondary">
                                    Mergi la Checkout
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default Cart;