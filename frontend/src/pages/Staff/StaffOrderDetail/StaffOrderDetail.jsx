"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button } from "react-bootstrap"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { appTheme } from "../../../constant/color_constants"
import StaffSidebar from "../StaffSidebar/StaffSidebar"

const StaffOrderDetail = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!location.state?.order)

  // Mock data - in real app, this would come from API
  const mockOrders = [
    {
      id: "ORD001",
      customer: "Nguyen Van A",
      phone: "0123456789",
      address: "123 Main St, District 1, HCMC",
      orderDate: "2024-06-30",
      orderTime: "10:30 AM",
      paymentMethod: "Cash",
      discountCode: "SUMMER10",
      status: "Completed",
      total: "165,000đ",
      items: [
        {
          id: 1,
          name: "Beef Pho",
          quantity: 1,
          unitPrice: "75,000đ",
          totalPrice: "75,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
        {
          id: 2,
          name: "Fish Cake",
          quantity: 2,
          unitPrice: "45,000đ",
          totalPrice: "90,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
      ],
    },
    {
      id: "ORD002",
      customer: "Tran Thi B",
      phone: "0987654321",
      address: "456 Le Loi, District 3, HCMC",
      orderDate: "2024-06-30",
      orderTime: "11:15 AM",
      paymentMethod: "VnPay",
      discountCode: "",
      status: "Processing",
      total: "100,000đ",
      items: [
        {
          id: 3,
          name: "Grilled Pork",
          quantity: 1,
          unitPrice: "65,000đ",
          totalPrice: "65,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
        {
          id: 4,
          name: "Spring Rolls",
          quantity: 1,
          unitPrice: "35,000đ",
          totalPrice: "35,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
      ],
    },
    {
      id: "ORD003",
      customer: "Le Van C",
      phone: "0369852147",
      address: "789 Nguyen Hue, District 1, HCMC",
      orderDate: "2024-06-30",
      orderTime: "12:45 PM",
      paymentMethod: "Cash",
      discountCode: "NEWUSER15",
      status: "Pending",
      total: "110,000đ",
      items: [
        {
          id: 1,
          name: "Beef Pho",
          quantity: 1,
          unitPrice: "75,000đ",
          totalPrice: "75,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
        {
          id: 4,
          name: "Spring Rolls",
          quantity: 1,
          unitPrice: "35,000đ",
          totalPrice: "35,000đ",
          image: "/placeholder.svg?height=60&width=60"
        },
      ],
    },
  ]

  useEffect(() => {
    if (!order && !loading) setLoading(false);
    // Nếu không có order truyền qua state, có thể fetch lại từ API ở đây nếu muốn
    // Hoặc giữ nguyên báo Order not found
  }, [order, loading]);

  const getStatusBadge = (status) => {
    const statusColors = {
      Completed: "success",
      Processing: "warning",
      Pending: "info",
      Cancelled: "danger",
    }
    return <Badge bg={statusColors[status] || "secondary"}>{status}</Badge>
  }

  const handleBack = () => {
    navigate("/staff-orders") // Adjust this path based on your routing
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <StaffSidebar />
        <div className="main-content" style={{ backgroundColor: appTheme.background }}>
          <Container fluid className="p-4">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </Container>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="dashboard-container">
        <StaffSidebar />
        <div className="main-content" style={{ backgroundColor: appTheme.background }}>
          <Container fluid className="p-4">
            <Row className="mb-4">
              <Col>
                <h2 style={{ color: appTheme.primary }}>Order Detail</h2>
                <p className="text-muted">Order not found.</p>
              </Col>
            </Row>
            <Row>
              <Col>
                <Card>
                  <Card.Body className="text-center">
                    <h5>Order Not Found</h5>
                    <p className="text-muted">The order you're looking for doesn't exist.</p>
                    <Button variant="secondary" onClick={handleBack}>
                      Back to Orders
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
              <h2 style={{ color: appTheme.primary }}>Order Detail - {order.id}</h2>
              <p className="text-muted">View detailed information about this order.</p>
            </Col>
          </Row>

          {/* Order Information Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                  <h5 className="mb-0">Order Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Order ID:</strong> {order.orderId}
                    </Col>
                    <Col md={6}>
                      <strong>Status:</strong> {getStatusBadge(order.status)}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Customer:</strong> {order.userName}
                    </Col>
                    <Col md={6}>
                      <strong>Phone:</strong> {order.phoneNumber}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Order Date:</strong> {order.createdAt}
                    </Col>
                    <Col md={6}>
                      <strong>Order Time:</strong> {order.createdAt}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Payment Method:</strong> {order.paymentMethod}
                    </Col>
                    <Col md={6}>
                      <strong>Discount Code:</strong> {order.discountCode}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={12}>
                      <strong>Address:</strong> {order.address}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Order Items Card */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                  <h5 className="mb-0">Order Items</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Unit Price</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{item.productName}</strong>
                          </td>
                          <td>{item.priceAtTime}</td>
                          <td>
                            <Badge bg="light" text="dark">{item.quantity}</Badge>
                          </td>
                          <td>
                            <strong>{item.priceAtTime * item.quantity}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end">
                          <strong>Total Amount:</strong>
                        </td>
                        <td>
                          <strong style={{ color: appTheme.primary, fontSize: "1.1em" }}>
                            {order.totalAmount}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row>
            <Col>
              <Button variant="secondary" onClick={handleBack} className="me-2">
                Back to Orders
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default StaffOrderDetail