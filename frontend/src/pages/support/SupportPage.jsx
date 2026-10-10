import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import {
  MessageCircle, Plus, Clock, CheckCircle, AlertCircle, XCircle,
  Phone, Mail, MapPin, Send, FileText, User, Calendar
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Chatbot from '../../components/Chatbot';
import ticketApi from '../../api/ticketApi';
import './SupportPage.css';

const SupportPage = () => {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    phoneNumber: ''
  });

  useEffect(() => {
    ticketApi.getMyTickets()
      .then(res => {
        const ticketList = res.data.map(ticket => ({
          ...ticket,
          title: ticket.subject,
          messages: ticket.messages || [],
          createdAt: ticket.createdAt || new Date().toISOString(),
          updatedAt: ticket.updatedAt || new Date().toISOString()
        }));
        setTickets(ticketList);
      })
      .catch(err => {
        console.error('Lỗi lấy danh sách ticket:', err);
      });
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await ticketApi.createTicket(formData);
      const newTicket = {
        ...res.data,
        title: res.data.subject,
        status: 'open',
        messages: [{
          id: 1,
          sender: 'customer',
          message: formData.description,
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTickets([newTicket, ...tickets]);
      setFormData({ subject: '', description: '', phoneNumber: '' });
      setShowCreateTicket(false);
    } catch (err) {
      console.error('Lỗi tạo ticket:', err);
      alert('Tạo ticket thất bại.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} className="text-warning" />;
      case 'pending': return <Clock size={16} className="text-info" />;
      case 'closed': return <CheckCircle size={16} className="text-success" />;
      default: return <XCircle size={16} className="text-danger" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open';
      case 'pending': return 'Pending';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

  const filteredTickets = tickets.filter(ticket =>
    filter === 'all' || ticket.status === filter
  );

  return (
    <div className="support-page" style={{ zoom: 0.8 }}>
      <Header />
      <div className="support-content">
        <Container>
          {/* Hero */}
          <div className="support-hero">
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <h1 className="support-title">
                  <MessageCircle size={48} className="me-3" />
                  Support Ticket
                </h1>
                <p className="support-subtitle">
                  We are here to help you with any issues or questions you may have.
                </p>
              </Col>
            </Row>
          </div>

          {/* Contact */}
          <Row className="mb-5">
            <Col md={4}>
              <Card className="contact-card text-center">
                <Card.Body>
                  <Phone size={32} />
                  <h5>Hotline</h5>
                  <p>1900-6066</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="contact-card text-center">
                <Card.Body>
                  <Mail size={32} />
                  <h5>Email</h5>
                  <p>support@veganfood.vn</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="contact-card text-center">
                <Card.Body>
                  <MapPin size={32} />
                  <h5>Address</h5>
                  <p>FPT University, Ngu Hanh Son, Da Nang</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Create Ticket CTA */}
          <Row className="mb-5">
            <Col>
              <Card className="support-actions-card">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4>Request Support</h4>
                    <p className="text-muted">Create a ticket to be processed.</p>
                  </div>
                  <Button variant="success" size="lg" onClick={() => setShowCreateTicket(true)}>
                    <Plus size={20} className="me-2" />Create a new ticket
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Ticket List */}
          <Row>
            <Col>
              <Card className="tickets-card">
                <Card.Header className="tickets-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                      <FileText size={24} className="me-2" />
                      Your support ticket
                    </h4>
                    <div className="filter-buttons">
                      <Button
                        variant={filter === 'all' ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className="me-2"
                      >
                        All
                      </Button>
                      <Button
                        variant={filter === 'open' ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setFilter('open')}
                        className="me-2"
                      >
                        Open
                      </Button>
                      <Button
                        variant={filter === 'pending' ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                        className="me-2"
                      >
                        Pending
                      </Button>
                      <Button
                        variant={filter === 'closed' ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setFilter('closed')}
                      >
                        Closed
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-5">
                      <FileText size={64} className="text-muted mb-3" />
                      <h5 className="text-muted">No tickets available</h5>
                      <p className="text-muted"> You don't have any support tickets or there are no tickets that match the current filter.</p>
                    </div>
                  ) : (
                    <div className="tickets-list">
                      {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="ticket-item" onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketDetail(true);
                        }}>
                          <div className="ticket-header">
                            <div className="ticket-title">
                              <h6 className="mb-1">{ticket.title}</h6>
                              <div className="ticket-meta">
                                <span className="ticket-category">{ticket.category}</span>
                              </div>
                            </div>
                            <div className="ticket-status">
                              {getStatusIcon(ticket.status)}
                              <span className="ms-2">{getStatusText(ticket.status)}</span>
                            </div>
                          </div>
                          <div className="ticket-content">
                            <p className="ticket-description">{ticket.description}</p>
                            <div className="ticket-footer">
                              <small className="text-muted">
                                <Calendar size={14} className="me-1" />
                                Created at: {formatDate(ticket.createdAt)}
                              </small>
                              <small className="text-muted">
                                <User size={14} className="me-1" />
                                {ticket.email}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Create Ticket Modal */}
      <Modal show={showCreateTicket} onHide={() => setShowCreateTicket(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><Plus className="me-2" />Create new support ticket</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTicket}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control type="text" name="subject" value={formData.subject}
                onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phonenumber</Form.Label>
              <Form.Control type="tel" name="phoneNumber" value={formData.phoneNumber}
                onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control as="textarea" rows={4} name="description"
                value={formData.description} onChange={handleInputChange} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateTicket(false)}>Cancel</Button>
            <Button variant="success" type="submit"><Send className="me-2" size={16} />Send ticket</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal show={showTicketDetail} onHide={() => setShowTicketDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FileText className="me-2" />Ticket detail #{selectedTicket?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <>
              <h5>{selectedTicket.title}</h5>
              <p className="text-muted"><Calendar size={14} className="me-2" />Created at: {formatDate(selectedTicket.createdAt)}</p>
              <h6 className="mt-4">Content:</h6>
              <p>{selectedTicket.description}</p>

              {selectedTicket.replyMessage && (
              <>
                <hr />
                <h6 className="mt-4">Feedback from staff:</h6>
                <p>{selectedTicket.replyMessage}</p>
                <small className="text-muted d-block mt-2">
                  👤 {selectedTicket.responder?.name || 'Nhân viên'} • 🕒 {formatDate(selectedTicket.repliedAt)}
                </small>
              </>
            )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTicketDetail(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default SupportPage;
