"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap"
import { appTheme } from "../../../constant/color_constants"
import StaffSidebar from "../StaffSidebar/StaffSidebar"
import { getProductById, feedBack } from "../../../api/product"

const StaffFoodDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState([])
  const [loadingFeedback, setLoadingFeedback] = useState(true)

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const data = await getProductById(id)
        setFood(data)
      } catch (err) {
        setFood(null)
      }
      setLoading(false)
    }
    fetchFood()
  }, [id])

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoadingFeedback(true)
      try {
        const data = await feedBack(id)
        console.log("Feedbacks:", data)
        // Sort feedback by date in descending order (newest first)
        const sortedFeedbacks = (data || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setFeedbacks(sortedFeedbacks)
      } catch (err) {
        setFeedbacks([])
      }
      setLoadingFeedback(false)
    }
    fetchFeedbacks()
  }, [id])

  const getStatusBadge = (status) => {
    const statusColors = {
      Available: "success",
      "Out of Stock": "danger",
      Limited: "warning",
    }
    return <Badge bg={statusColors[status]}>{status}</Badge>
  }

  const handleBack = () => {
    navigate("/staff-food")
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <StaffSidebar />
        <div className="main-content" style={{ backgroundColor: appTheme.background }}>
          <Container fluid className="p-4">
            <div className="text-center">
              <Spinner animation="border" variant="success" />
            </div>
          </Container>
        </div>
      </div>
    )
  }

  if (!food) {
    return (
      <div className="dashboard-container">
        <StaffSidebar />
        <div className="main-content" style={{ backgroundColor: appTheme.background }}>
          <Container fluid className="p-4">
            <Row className="mb-4">
              <Col>
                <h2 style={{ color: appTheme.primary }}>Food Detail</h2>
                <p className="text-muted">Food item not found.</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card>
                  <Card.Body className="text-center">
                    <h5>Food Item Not Found</h5>
                    <p className="text-muted">The food item you're looking for doesn't exist.</p>
                    <Button variant="secondary" onClick={handleBack}>
                      Back to Food List
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: appTheme.primary }}>Food Detail - {food.name}</h2>
              <p className="text-muted">View detailed information about this food item.</p>
            </Col>
          </Row>

          {/* Main Food Information Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
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
                          <strong>Product ID:</strong> {food.product_id}
                        </Col>
                        <Col md={6}>
                          <strong>Status:</strong> {getStatusBadge(food.status)}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Name:</strong> {food.name}
                        </Col>
                        <Col md={6}>
                          <strong>Category:</strong> {food.category}
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Price:</strong>
                          <span style={{ color: appTheme.primary, fontSize: "1.2em", fontWeight: "bold", marginLeft: "8px" }}>
                            {food.price}
                          </span>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Stock Quantity:</strong> {food.stock_quantity} units
                        </Col>
                        <Col md={6}>
                          <strong>Total Orders:</strong> {food.total_order} orders
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={12}>
                          <strong>Description:</strong>
                          <p className="mt-2 text-muted">{food.description}</p>
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
                <Card.Header style={{ backgroundColor: appTheme.secondary }}>
                  <h5 className="mb-0" style={{ color: appTheme.primary }}>Customer Feedback</h5>
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
                                color: appTheme.primary,
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
              <Button variant="secondary" onClick={handleBack} className="me-2">
                Back to Food List
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default StaffFoodDetail