import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import Sidebar from "../ManagerSidebar/ManagerSidebar";
import { getProductById, feedBack } from "../../../api/product";
import "./ManagerFoodList.css";

const getStatusBadge = (status) => {
  const statusColors = {
    Active: "success",
    Inactive: "secondary",
    Available: "success",
    "Out of Stock": "danger",
    Limited: "warning",
  };
  return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>;
};

const getStockBadge = (quantity) => {
  if (quantity === 0) return <Badge bg="danger">Out of Stock</Badge>;
  if (quantity <= 10) return <Badge bg="warning" text="dark">Low Stock</Badge>;
  return <Badge bg="success">In Stock</Badge>;
};

const ManagerFoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  // Lấy sản phẩm theo id
  useEffect(() => {
    setLoading(true);
    getProductById(id)
      .then((data) => setFood(data))
      .catch(() => setFood(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Lấy feedback cho sản phẩm
  useEffect(() => {
    setLoadingFeedback(true);
    feedBack(id)
      .then((data) => setFeedbacks(data))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoadingFeedback(false));
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content" style={{ backgroundColor: "#FFFBE6" }}>
          <Container fluid className="p-4">
            <div className="text-center">
              <Spinner animation="border" variant="success" />
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <Container className="py-5">
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3>Food Not Found</h3>
                <p>The food item you are looking for does not exist.</p>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: "#FFFBE6" }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: "#347928" }}>Food Detail - {food.name}</h2>
              <p className="text-muted">View detailed information about this food item.</p>
            </Col>
          </Row>

          {/* Main Food Information Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: "#347928", color: "white" }}>
                  <h5 className="mb-0">Product Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="text-center">
                      <img
                        src={food.image_url || "/placeholder.svg"}
                        alt={food.name}
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          height: "300px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          border: "2px solid #e9ecef"
                        }}
                      />
                    </Col>
                    <Col md={8}>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Name:</strong> {food.name}
                        </Col>
                        <Col md={6}>
                          <strong>Status:</strong> {getStatusBadge(food.status)}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Category:</strong> {food.category}
                        </Col>
                        <Col md={6}>
                          <strong>Stock Status:</strong> {getStockBadge(food.stock_quantity)}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Price:</strong>
                          <span style={{ color: "#347928", fontSize: "1.2em", fontWeight: "bold", marginLeft: "8px" }}>
                            {food.price?.toLocaleString()}đ
                          </span>
                        </Col>
                        <Col md={6}>
                          <strong>Stock Quantity:</strong> {food.stock_quantity} units
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={12}>
                          <strong>Description:</strong>
                          <p className="mt-2 text-muted">{food.description}</p>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={12}>
                          <strong>Total Orders:</strong> {food.total_order} orders
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Feedback Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: "#C0EBA6" }}>
                  <h5 className="mb-0" style={{ color: "#347928" }}>Customer Feedback</h5>
                </Card.Header>
                <Card.Body style={{ background: "#f8f9fa", maxHeight: 380, overflowY: "auto" }}>
                  {loadingFeedback ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="success" />
                    </div>
                  ) : feedbacks.length === 0 ? (
                    <div className="text-center text-muted">No feedback yet.</div>
                  ) : (
                    <div>
                      {feedbacks.map((fb, idx) => (
                        <Card
                          key={idx}
                          className="mb-3"
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                            background: "#fff"
                          }}
                        >
                          <Card.Body className="d-flex">
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: "#e0ffe0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 20,
                                color: "#347928",
                                marginRight: 16,
                                flexShrink: 0
                              }}
                            >
                              {fb.userName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="fw-bold" style={{ fontSize: 16 }}>
                                {fb.userName}
                                <span className="text-muted" style={{ fontWeight: 400, fontSize: 13, marginLeft: 10 }}>
                                  {new Date(fb.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div style={{ fontSize: 15, marginTop: 4 }}>{fb.comment}</div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row>
            <Col>
              <Button variant="secondary" onClick={() => navigate(-1)} className="me-2">
                Back to Food List
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ManagerFoodDetail;