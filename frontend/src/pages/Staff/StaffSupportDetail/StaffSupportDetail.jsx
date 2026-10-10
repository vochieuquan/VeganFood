import { useParams, useNavigate, useLocation } from "react-router-dom"
import StaffSidebar from "../StaffSidebar/StaffSidebar"
import { Container, Row, Col, Card, Button, Badge, Alert } from "react-bootstrap"
import { appTheme } from "../../../constant/color_constants"

const getStatusBadge = (status) => {
  const colors = { 
    pending: "warning",
    "in progress": "info", 
    resolved: "success", 
    closed: "secondary"
  }
  return <Badge bg={colors[status] || 'secondary'} className="px-3 py-2">{status}</Badge>
}

const StaffSupportDetail = () => {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const ticket = location.state?.ticket

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate(-1)}
                className="mb-3"
              >
                ← Back to Support List
              </Button>
              <h2 style={{ color: appTheme.primary }}>Customer Support Detail</h2>
              <p className="text-muted">View detailed information about the support request.</p>
            </Col>
          </Row>

          <Row>
            <Col>
              {ticket ? (
                <Card className="shadow-sm">
                  <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                    <Row className="align-items-center">
                      <Col>
                        <h5 className="mb-0">Ticket #{ticket.ticketId}</h5>
                      </Col>
                      <Col xs="auto">
                        {getStatusBadge(ticket.status)}
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="mb-4">
                      <Col md={6}>
                        <Card className="h-100 border-0" style={{ backgroundColor: "#F8F9FA" }}>
                          <Card.Body>
                            <h6 className="text-muted mb-2">TICKET INFORMATION</h6>
                            <div className="mb-3">
                              <strong>Ticket ID:</strong>
                              <div className="mt-1">#{ticket.ticketId}</div>
                            </div>
                            <div className="mb-3">
                              <strong>Created Time:</strong>
                              <div className="mt-1">
                                {ticket.createdAt 
                                  ? new Date(ticket.createdAt).toLocaleString()
                                  : 'N/A'}
                              </div>
                            </div>
                            <div className="mb-3">
                              <strong>Assigned To:</strong>
                              <div className="mt-1">
                                {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                              </div>
                            </div>
                            {ticket.repliedAt && (
                              <div className="mb-0">
                                <strong>Replied At:</strong>
                                <div className="mt-1">
                                  {new Date(ticket.repliedAt).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="h-100 border-0" style={{ backgroundColor: "#F8F9FA" }}>
                          <Card.Body>
                            <h6 className="text-muted mb-2">CUSTOMER INFORMATION</h6>
                            <div className="mb-3">
                              <strong>Customer Name:</strong>
                              <div className="mt-1">{ticket.user.name}</div>
                            </div>
                            <div className="mb-3">
                              <strong>Customer Email:</strong>
                              <div className="mt-1">{ticket.user.email}</div>
                            </div>
                            <div className="mb-3">
                              <strong>Phone Number:</strong>
                              <div className="mt-1">{ticket.user.phoneNumber || 'N/A'}</div>
                            </div>
                            <div className="mb-3">
                              <strong>Subject:</strong>
                              <div className="mt-1">{ticket.subject}</div>
                            </div>
                            <div className="mb-0">
                              <strong>Current Status:</strong>
                              <div className="mt-2">{getStatusBadge(ticket.status)}</div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col>
                        <Card className="border-0" style={{ backgroundColor: "#F8F9FA" }}>
                          <Card.Body>
                            <h6 className="text-muted mb-3">ISSUE DESCRIPTION</h6>
                            <div className="p-3" style={{ 
                              backgroundColor: "white", 
                              borderRadius: "8px",
                              border: "1px solid #E9ECEF"
                            }}>
                              <p className="mb-0" style={{ lineHeight: "1.6" }}>
                                {ticket.description}
                              </p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {ticket.replyMessage && (
                      <Row className="mb-4">
                        <Col>
                          <Card className="border-0" style={{ backgroundColor: "#E8F5E8" }}>
                            <Card.Body>
                              <h6 className="text-muted mb-3">STAFF RESPONSE</h6>
                              <div className="p-3" style={{ 
                                backgroundColor: "white", 
                                borderRadius: "8px",
                                border: "1px solid #C8E6C9"
                              }}>
                                <p className="mb-2" style={{ lineHeight: "1.6" }}>
                                  {ticket.replyMessage}
                                </p>
                                {ticket.responder && (
                                  <small className="text-muted">
                                    Responded by: {ticket.responder.name} 
                                    {ticket.repliedAt && ` on ${new Date(ticket.repliedAt).toLocaleString()}`}
                                  </small>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    )}

                    <Row className="mt-4">
                      <Col>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-secondary"
                            onClick={() => navigate(`/staff-support`)}
                          >
                            Back to List
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="warning" className="text-center">
                  <h5>Ticket Not Found</h5>
                  <p className="mb-3">The support ticket with ID "{ticketId}" could not be found or no data was passed.</p>
                  <Button variant="primary" onClick={() => navigate("/staff-support")}>
                    Return to Support List
                  </Button>
                </Alert>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default StaffSupportDetail