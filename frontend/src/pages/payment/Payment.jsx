import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import './Payment.css';

const Payment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayOS = async () => {
    setLoading(true);
    try {
      // Gọi trực tiếp PayOS API demo (chỉ dùng cho demo, không bảo mật)
      const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.REACT_APP_PAYOS_CLIENT_ID,
          'x-api-key': process.env.REACT_APP_PAYOS_API_KEY,
        },
        body: JSON.stringify({
          orderCode: Math.floor(Math.random() * 1000000000), // mã đơn hàng random
          amount: 250000,
          description: 'Thanh toán đơn hàng Vegetarian Restaurant',
          returnUrl: window.location.origin + '/account/orders', // sau khi thanh toán xong sẽ chuyển về đây
          cancelUrl: window.location.href,
        }),
      });
      const data = await response.json();
      if (data.data && data.data.checkoutUrl) {
        window.open(data.data.checkoutUrl, '_blank');
      } else {
        alert('Không lấy được link thanh toán PayOS!');
      }
    } catch (err) {
      alert('Có lỗi khi kết nối PayOS!');
    }
    setLoading(false);
  };

  return (
    <div className="payment-bg" style={{ zoom: 0.8 }}>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="payment-card shadow-lg">
              <Card.Body>
                <div className="text-center mb-4">
                  <h2 className="payment-title">Thanh toán qua PayOS</h2>
                  <p className="payment-desc">
                    Nhấn nút bên dưới để chuyển đến trang thanh toán PayOS.
                  </p>
                </div>
                <div className="d-flex flex-column align-items-center">
                  <div className="payment-amount mb-3">
                    <span>Số tiền:</span>
                    <span className="payment-amount-value"> 250.000&nbsp;₫</span>
                  </div>
                  <Button
                    variant="success"
                    className="payment-btn"
                    onClick={handlePayOS}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" /> : 'Thanh toán với PayOS'}
                  </Button>
                  <div className="payment-note mt-3">
                    <span>Lưu ý:</span> Sau khi thanh toán thành công, vui lòng kiểm tra trạng thái đơn hàng trong tài khoản của bạn.
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Payment;