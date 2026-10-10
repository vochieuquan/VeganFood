import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, ListGroup, Badge, Image, Table, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BillPage.css";
import Header from "../../components/Header";
import { useParams, useSearchParams } from "react-router-dom";
import { getBill, getPayOS, cancelOrder } from "../../api/order";

const statusColor = {
    'pending': 'warning',
    'paid': 'success',
    'shipped': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
};

const BillPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(180);
    const [isRetryingPayment, setIsRetryingPayment] = useState(false);
    const timerRef = useRef();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const cancelRequested = searchParams.get("cancelled") === "1";
    const [bill, setBill] = useState({
        orderId: 0,
        userName: '',
        status: '',
        paymentMethod: '',
        totalAmount: 0,
        phoneNumber: '',
        address: '',
        createdAt: '',
        items: [],
        discountCode: '',
        discountPercentage: 0
    });

    useEffect(() => {
        const fetchBill = async () => {
            if (!id) {
                setBill(null);
                return;
            }
            try {
                if (cancelRequested) {
                    try {
                        await cancelOrder(id);
                    } catch {
                        // The payment webhook may already have completed the order.
                    }
                }
                setBill(await getBill(id));
            } catch (error) {
                setBill(null);
            }
        };
        fetchBill();
    }, [id, cancelRequested]);

    useEffect(() => {
        if (!id || bill?.status !== 'pending' || bill?.paymentMethod !== 'VNPAY') return undefined;
        const interval = setInterval(async () => {
            try {
                setBill(await getBill(id));
            } catch (error) {
                // Keep the last known order status if a refresh briefly fails.
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [id, bill?.status, bill?.paymentMethod]);

    useEffect(() => {
        if (bill?.status === "pending" && countdown > 0) {
            timerRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [bill?.status, countdown]);

    useEffect(() => {
        if (countdown <= 0) {
            clearInterval(timerRef.current);
        }
    }, [countdown]);

    const handleCancelOrder = async () => {
        try {
            await cancelOrder(bill.orderId);
            setBill(await getBill(bill.orderId));
            setShowModal(false);
        } catch (error) {
            setShowModal(false);
        }
    };

    const handleRetryPayment = async () => {
        setIsRetryingPayment(true);
        try {
            const payment = await getPayOS(bill.orderId);
            if (!payment?.checkoutUrl) throw new Error('No payment link was returned.');
            window.location.assign(payment.checkoutUrl);
        } catch {
            alert('The payment link is not available yet. Please try again shortly.');
        } finally {
            setIsRetryingPayment(false);
        }
    };

    // Hàm format mm:ss
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="bill-bg min-vh-100" style={{ backgroundColor: "#FFFBE6", paddingTop: 100, zoom: 0.8 }}>
            <Header />
            <Container fluid className="py-5">
               
                <Row className="justify-content-center gx-5">
                    {/* Thông tin khách hàng */}
                    <Col md={4} className="mb-4">
                        <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                            <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">Thông tin khách hàng</h5>
                            <div className="d-flex align-items-center mb-4">
                                <Image
                                    src="https://cdn-icons-png.flaticon.com/512/2909/2909769.png"
                                    roundedCircle
                                    width={70}
                                    height={70}
                                    alt="avatar"
                                    className="me-3"
                                    style={{ background: "#e8f5e9", padding: 8 }}
                                />
                                <div>
                                    <div className="fw-bold fs-4">{bill?.userName}</div>
                                    <div className="text-muted">{bill?.phoneNumber}</div>
                                </div>
                            </div>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="border-0 px-0 pb-2">
                                    <strong>Address:</strong>
                                    <div>{bill?.address}</div>
                                </ListGroup.Item>
                                <ListGroup.Item className="border-0 px-0 pb-2">
                                    <strong>Date:</strong>
                                    <div>{new Date(bill?.createdAt).toLocaleString('vi-VN')}</div>
                                </ListGroup.Item>
                                <ListGroup.Item className="border-0 px-0">
                                    <strong>Payment method:</strong>
                                    <div>{bill?.paymentMethod}</div>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </Col>
                    {/* Thông tin đơn hàng + món ăn */}
                    <Col md={8}>
                        <div className="p-4 bg-white rounded-4 shadow-sm mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-4 border-bottom pb-2 text-success">Order information</h5>
                                {bill?.status === "pending" && countdown > 0 && (
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="text-danger fw-bold" style={{ minWidth: 60 }}>
                                            {formatTime(countdown)}
                                        </span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => setShowModal(true)}
                                        >
                                            Cancel Order
                                        </Button>

                                    </div>
                                )}
                                {bill?.status === 'pending' && bill?.paymentMethod === 'VNPAY' && (
                                    <Button variant="success" size="sm" onClick={handleRetryPayment} disabled={isRetryingPayment}>
                                        {isRetryingPayment ? 'Opening…' : 'Retry PayOS payment'}
                                    </Button>
                                )}
                            </div>
                            <Row>
                                <Col md={6}>
                                    <ListGroup variant="flush" className="mb-3">
                                        <ListGroup.Item className="border-0 px-0 pb-2">
                                            <Row>
                                                <Col xs={7}><strong>Order ID:</strong></Col>
                                                <Col xs={5} className="text-end">#{bill?.orderId}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="border-0 px-0 pb-2">
                                            <Row>
                                                <Col xs={7}><strong>Status:</strong></Col>
                                                <Col xs={5} className="text-end">
                                                    <Badge bg={statusColor[bill?.status]}>{bill?.status}</Badge>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="border-0 px-0 pb-2">
                                            <Row>
                                                <Col xs={7}><strong>Payment:</strong></Col>
                                                <Col xs={5} className="text-end">{bill?.paymentMethod}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="border-0 px-0 pb-2">
                                            <Row>
                                                <Col xs={7}><strong>Payment ID:</strong></Col>
                                                <Col xs={5} className="text-end">-</Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="border-0 px-0">
                                            <Row>
                                                <Col xs={7}><strong>Discount code:</strong></Col>
                                                <Col xs={5} className="text-end">{bill?.discountCode || '-'}</Col>
                                            </Row>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                                <Col md={6} className="d-flex align-items-center justify-content-end">
                                    <div className="bg-light rounded-3 px-4 py-3 text-end">
                                        <span className="fw-bold fs-5 me-2">Total:</span>
                                        <span className="text-success fs-3 fw-bold">
                                            {bill?.totalAmount.toLocaleString()} <span className="text-muted fs-6">VND</span>
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="p-4 bg-white rounded-4 shadow-sm">
                            <h5 className="fw-bold mb-3 text-success">List of food</h5>
                            <Table responsive bordered hover size="sm" className="align-middle bg-white rounded-3 overflow-hidden">
                                <thead className="table-success">
                                    <tr>
                                        <th></th>
                                        <th>Food</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill?.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.productName}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td>{item.priceAtTime.toLocaleString()} VND</td>
                                            <td className="text-success fw-bold">
                                                {(item.priceAtTime * item.quantity).toLocaleString()} VND
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                <div className="text-center text-muted mt-4" style={{ fontSize: 16 }}>
                    <span role="img" aria-label="leaf">🌱</span> Thank you for your order!
                </div>
            </Container>

            {/* Modal xác nhận hủy */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Cancel Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to cancel this order?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={handleCancelOrder}>
                        Confirm Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BillPage;
