import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Row, Col, ListGroup, Image, Stack } from 'react-bootstrap';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import { getProfile } from '../../api/customer_profile';
import { checkoutOrder, getPayOS } from '../../api/order';
import { getDiscountByCode } from '../../api/discount';

const OrderPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const cartItems = location.state?.cartItems || [];

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const [profileLoading, setProfileLoading] = useState(true);

    const [paymentInfo, setPaymentInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        province: '',
        ward: '',
        note: ''
    });

    const [selectedPayment, setSelectedPayment] = useState('COD');

    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [discountCode, setDiscountCode] = useState('');
    const [discount, setDiscount] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                let address = data.address || '';
                let province = '';
                let ward = '';
                let street = '';

                if (address) {
                    const parts = address.split(',').map(part => part.trim());
                    if (parts.length >= 3) {
                        street = parts[0];
                        ward = parts[1];
                        province = parts[2];
                    } else if (parts.length === 2) {
                        street = parts[0];
                        province = parts[1];
                    } else if (parts.length === 1) {
                        street = parts[0];
                    }
                }

                setPaymentInfo(prev => ({
                    ...prev,
                    fullName: data.name || '',
                    email: data.email || '',
                    phone: data.phoneNumber || '',
                    address: street,
                    province: province,
                    ward: ward,
                }));
            } catch (err) {
                // Có thể xử lý lỗi ở đây nếu cần
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        fetch('https://vietnamlabs.com/api/vietnamprovince')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.data)) setProvinces(data.data);
                else setProvinces([]);
            });
    }, []);

    useEffect(() => {
        // Khi chọn province thì cập nhật danh sách wards
        const selectedProvince = provinces.find(p => p.province === paymentInfo.province);
        if (selectedProvince) {
            setWards(selectedProvince.wards);
        } else {
            setWards([]);
        }
    }, [paymentInfo.province, provinces]);

    if (profileLoading) return null;

    if (!cartItems || cartItems.length === 0) {
        return null;
    }

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const shippingFee = 20000;
    const subtotal = calculateSubtotal();
    const discountAmount = discount ? Math.round(subtotal * discount.percentage / 100) : 0;
    const total = subtotal - discountAmount + shippingFee;

    const handleApplyDiscount = async () => {
        const code = discountCode.trim();
        if (!code) {
            setDiscountError('Enter a discount code.');
            return;
        }
        setIsApplyingDiscount(true);
        setDiscountError('');
        try {
            const result = await getDiscountByCode(code);
            if (result?.status !== 'Available' || Number(result.quantity) <= 0
                || Number(result.percentage) < 1 || Number(result.percentage) > 100) {
                throw new Error('This discount code is unavailable.');
            }
            setDiscount(result);
            setDiscountCode(result.discountCode);
        } catch (error) {
            setDiscount(null);
            setDiscountError('This discount code is invalid or unavailable.');
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePaymentChange = (e) => {
        setSelectedPayment(e.target.value);
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate Phone Number
        if (!paymentInfo.phone || paymentInfo.phone.trim() === '') {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10,11}$/.test(paymentInfo.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Phone number must be 10-11 digits';
        }

        // Validate Address
        if (!paymentInfo.address || paymentInfo.address.trim() === '') {
            newErrors.address = 'Address is required';
        }

        // Validate Province
        if (!paymentInfo.province || paymentInfo.province.trim() === '') {
            newErrors.province = 'Province/City is required';
        }

        // Validate Ward
        if (!paymentInfo.ward || paymentInfo.ward.trim() === '') {
            newErrors.ward = 'Ward is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckout = async (event) => {
        event?.preventDefault();
        if (isSubmitting) return;

        // Validate form trước khi submit
        if (!validateForm()) {
            alert('Please fill in all required fields correctly!');
            return;
        }

        setIsSubmitting(true);

        const paymentMethod = selectedPayment === 'vnpay' ? 'VNPAY' : 'CASH';
        const orderData = {
            paymentMethod,
            phoneNumber: paymentInfo.phone,
            address: `${paymentInfo.address}${paymentInfo.ward ? ', ' + paymentInfo.ward : ''}${paymentInfo.province ? ', ' + paymentInfo.province : ''}`,
            discountCode: discount?.discountCode || '',
        };
        try {
            const res = await checkoutOrder(orderData);
            const orderId = res?.orderId;
            if (!orderId) {
                throw new Error('The server did not return an order ID.');
            }

            if (selectedPayment === 'vnpay') {
                try {
                    const paymentRes = await getPayOS(orderId);
                    if (paymentRes?.checkoutUrl) {
                        window.location.assign(paymentRes.checkoutUrl);
                        return;
                    }
                } catch {
                    // The order already exists; avoid asking the customer to submit it again.
                }
                alert('Your order was placed, but the payment link could not be created. You can retry payment from the order page.');
                navigate(`/billing/${orderId}`);
            } else {
                navigate(`/account/orders`);
            }
        } catch (err) {
            alert('Order failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ paddingTop: '105px', zoom: 0.8 }}>
            <Header />
            <Container className="py-4 flex-grow-1" style={{ marginTop: '20px' }}>
                <div className="d-flex justify-content-between align-items-start">
                    {/* Left Side - Form */}
                    <div className="w-75 pe-4">
                        <h2 className="mb-4">Shipping Information</h2>
                        <Form onSubmit={handleCheckout}>
                            <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={paymentInfo.fullName}
                                    onChange={handleInputChange}
                                    readOnly
                                />
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={paymentInfo.email}
                                            onChange={handleInputChange}
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            name="phone"
                                            value={paymentInfo.phone}
                                            onChange={handleInputChange}
                                            required
                                            isInvalid={!!errors.phone}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.phone}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={paymentInfo.address}
                                    onChange={handleInputChange}
                                    required
                                    isInvalid={!!errors.address}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.address}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Province/City</Form.Label>
                                        <Form.Select
                                            name="province"
                                            value={paymentInfo.province}
                                            onChange={handleInputChange}
                                            required
                                            isInvalid={!!errors.province}
                                        >
                                            <option value="">Select province/city</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.province}>{province.province}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.province}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ward</Form.Label>
                                        <Form.Select
                                            name="ward"
                                            value={paymentInfo.ward}
                                            onChange={handleInputChange}
                                            required
                                            disabled={!wards.length}
                                            isInvalid={!!errors.ward}
                                        >
                                            <option value="">Select ward</option>
                                            {wards.map(ward => (
                                                <option key={ward.name} value={ward.name}>{ward.name}</option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.ward}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* <Form.Group className="mb-3">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="note"
                                    value={paymentInfo.note}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Note for the dish (if any)"
                                />
                            </Form.Group> */}

                            {/* Payment Methods Section */}
                            <div className="payment-methods mt-4">
                                <h2 className="mb-4">Payment Method</h2>
                                <Form.Group
                                    style={{ marginBottom: '120px' }}
                                >
                                    <div className="payment-method__item mb-3">
                                        <Form.Check
                                            type="radio"
                                            id="payment-COD"
                                            name="payment-method"
                                            value="COD"
                                            onChange={handlePaymentChange}
                                            label={
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                                                        alt="COD"
                                                        className="payment-icon me-3"
                                                        style={{ width: '40px', height: '40px' }}

                                                    />
                                                    <span className="payment-label">
                                                        <strong>Cash on Delivery</strong>
                                                    </span>
                                                </div>
                                            }
                                            defaultChecked
                                        />
                                    </div>

                                    <div className="payment-method__item mb-3">
                                        <Form.Check
                                            type="radio"
                                            id="payment-vnpay"
                                            name="payment-method"
                                            value="vnpay"
                                            onChange={handlePaymentChange}
                                            label={
                                                <div className="d-flex align-items-center">
                                                    <span className="payment-label">
                                                        <strong>Online payment (PayOS)</strong>
                                                        <br />
                                                        <span className="text-muted small">Pay securely with PayOS</span>
                                                    </span>
                                                </div>
                                            }
                                        />
                                    </div>
                                </Form.Group>
                            </div>
                        </Form>
                    </div>

                    {/* Right Side - Order Summary */}
                    <Col md={3} className="bg-light p-3" style={{ marginBottom: '120px' }}>
                        <h3 className="mb-3">Your Order</h3>

                        <ListGroup className="mb-4">
                            {cartItems.map(item => (
                                <ListGroup.Item key={item.id} className="border-0 px-0">
                                    <Row className="align-items-center">
                                        <Col xs={3}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fluid
                                                className="rounded"
                                            />
                                        </Col>
                                        <Col xs={9}>
                                            <div className="d-flex justify-content-between">
                                                <h6 className="mb-1">{item.name}</h6>
                                                <span>{item.price.toLocaleString()}₫</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">Quantity: {item.quantity}</small>
                                                <span className="fw-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                                            </div>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>

                        <Stack gap={2}>
                            <Row className="align-items-center">
                                <Col>Subtotal:</Col>
                                <Col xs="auto">{subtotal.toLocaleString()}₫</Col>
                            </Row>
                            {discount && (
                                <Row className="align-items-center text-success">
                                    <Col>Discount ({discount.percentage}%):</Col>
                                    <Col xs="auto">−{discountAmount.toLocaleString()}₫</Col>
                                </Row>
                            )}
                            <Row className="align-items-center">
                                <Col>Shipping Fee:</Col>
                                <Col xs="auto">{shippingFee.toLocaleString()}₫</Col>
                            </Row>
                            <hr className="my-2" />
                            <Row className="align-items-center">
                                <Col className="fw-bold">Total:</Col>
                                <Col xs="auto" className="fw-bold">{total.toLocaleString()}₫</Col>
                            </Row>
                        </Stack>

                        {/* Discount Code */}
                        <Form.Group className="mt-3">
                            <Form.Control
                                type="text"
                                placeholder="Discount code"
                                className="mb-2"
                                value={discountCode}
                                onChange={(e) => {
                                    setDiscountCode(e.target.value);
                                    setDiscount(null);
                                    setDiscountError('');
                                }}
                            />
                            <Button type="button" variant="outline-success" onClick={handleApplyDiscount} disabled={isApplyingDiscount}>
                                {isApplyingDiscount ? 'Checking…' : 'Apply code'}
                            </Button>
                            {discountError && <div className="text-danger small mt-2">{discountError}</div>}
                        </Form.Group>
                    </Col>
                </div>
            </Container>
            <div className="fixed-bottom bg-white border-top p-3">
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            {selectedPayment === 'COD' && (
                                <>
                                    <img
                                        src="https://mcdn.coolmate.me/image/October2024/mceclip2_42.png"
                                        alt="COD" className="me-2" style={{ width: '24px', height: '24px' }} />
                                    <span>
                                        <strong>COD</strong> pay on delivery
                                    </span>
                                </>
                            )}
                            {selectedPayment === 'vnpay' && (
                                <>
                                    <span>
                                        <strong>PayOS</strong> online payment
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="text-end">
                            <div className="total-amount">
                                <span>Total: </span>
                                <span className="text-primary fw-bold">{total.toLocaleString()}₫</span>
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Placing Order…' : 'Place Order'}
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
            <Chatbot />
        </div>
    );
};

export default OrderPage;
