import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Payment.css';

const Payment = () => (
  <div className="payment-bg" style={{ zoom: 0.8 }}>
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="payment-card shadow-lg">
            <Card.Body className="text-center">
              <h2 className="payment-title">Thanh toán đơn hàng</h2>
              <p className="payment-desc">
                Chọn phương thức thanh toán tại bước xác nhận đơn hàng. Liên kết PayOS sẽ được tạo an toàn từ máy chủ.
              </p>
              <Button as={Link} to="/cart/order" variant="success" className="payment-btn">
                Tiếp tục đặt hàng
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Payment;
