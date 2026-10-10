"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, InputGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { appTheme } from "../../../constant/color_constants"
import StaffSidebar from "../StaffSidebar/StaffSidebar"
import { getTickets, replyTicket, updateTicketStatus } from '../../../api/support'

const StaffSupport = () => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [selectedTicketForStatus, setSelectedTicketForStatus] = useState(null)
  const [supportTickets, setSupportTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignedToFilter, setAssignedToFilter] = useState("all")
  const [replyMessage, setReplyMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Gọi API lấy danh sách tickets khi vào trang
  useEffect(() => {
    getTickets().then(data => {
      setSupportTickets(data);
      setFilteredTickets(data);
      setLoading(false);
    }).catch(() => {
      setSupportTickets([]);
      setFilteredTickets([]);
      setLoading(false);
    });
  }, []);

  // Lọc tickets theo từ khóa tìm kiếm, status và assigned to
  useEffect(() => {
    let filtered = supportTickets;

    // Lọc theo search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(ticket => 
        ticket.ticketId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo status
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Lọc theo assigned to
    if (assignedToFilter !== "all") {
      if (assignedToFilter === "unassigned") {
        filtered = filtered.filter(ticket => !ticket.assignedTo);
      } else {
        filtered = filtered.filter(ticket => 
          ticket.assignedTo && ticket.assignedTo.userId.toString() === assignedToFilter
        );
      }
    }

    setFilteredTickets(filtered);
  }, [searchTerm, statusFilter, assignedToFilter, supportTickets]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAssignedToFilterChange = (e) => {
    setAssignedToFilter(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAssignedToFilter("all");
  };

  // Lấy danh sách unique assignees để hiển thị trong dropdown
  const getUniqueAssignees = () => {
    const assignees = supportTickets
      .filter(ticket => ticket.assignedTo)
      .map(ticket => ticket.assignedTo)
      .reduce((unique, assignee) => {
        if (!unique.find(u => u.userId === assignee.userId)) {
          unique.push(assignee);
        }
        return unique;
      }, []);
    return assignees;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      "in progress": "info",
      resolved: "success",
      closed: "secondary",
    }
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>
  }

  const handleViewDetail = (ticket) => {
    navigate(`/staff-support-detail/${ticket.ticketId}`, { state: { ticket } })
  }

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const handleStatusUpdate = (ticketId, newStatus) => {
    setSupportTickets(
      supportTickets.map((ticket) => (ticket.ticketId === ticketId ? { ...ticket, status: newStatus } : ticket)),
    )
    setShowModal(false)
  }

  const handleSendResponse = async () => {
    if (!replyMessage.trim()) {
      alert('Please enter a response message!');
      return;
    }

    setSending(true);
    try {
      const res = await replyTicket(selectedTicket.ticketId, replyMessage);

      if (res && res.ticketId) {
        alert('Response sent successfully!');

        setSupportTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.ticketId === res.ticketId ? res : ticket
          )
        );

        setFilteredTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.ticketId === res.ticketId ? res : ticket
          )
        );

        setShowModal(false);
        setReplyMessage("");
        setSelectedTicket(null);
      } else {
        alert('Failed to send response!');
      }
    } catch (err) {
      console.error('Error sending response:', err);
      alert('Failed to send response!');
    } finally {
      setSending(false);
    }
  };

  const openStatusModal = (ticket) => {
    setSelectedTicketForStatus(ticket)
    setShowStatusModal(true)
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicketForStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await updateTicketStatus(selectedTicketForStatus.ticketId, newStatus);

      if (res && res.ticketId) {
        alert('Status updated successfully!');

        // Cập nhật ticket trong danh sách
        setSupportTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.ticketId === res.ticketId ? res : ticket
          )
        );

        // Cập nhật filtered tickets nếu có search
        setFilteredTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.ticketId === res.ticketId ? res : ticket
          )
        );

        setShowStatusModal(false);
        setSelectedTicketForStatus(null);
      } else {
        alert('Failed to update status!');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Thống kê tickets
  const openTickets = filteredTickets.filter(t => t.status === 'pending').length;
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in progress').length;
  const resolvedTickets = filteredTickets.filter(t => t.status === 'resolved').length;
  const closedTickets = filteredTickets.filter(t => t.status === 'closed').length;

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: appTheme.primary }}>Customer Support</h2>
              <p className="text-muted">Manage customer inquiries and support requests.</p>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Ticket ID, Customer Name, or Subject..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={assignedToFilter} onChange={handleAssignedToFilterChange}>
                <option value="all">All Assigned</option>
                <option value="unassigned">Unassigned</option>
                {getUniqueAssignees().map(assignee => (
                  <option key={assignee.userId} value={assignee.userId.toString()}>
                    {assignee.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={handleResetFilters}
                className="w-100"
                disabled={searchTerm === "" && statusFilter === "all" && assignedToFilter === "all"}
              >
                <i className="fas fa-undo me-1"></i>
                Reset
              </Button>
            </Col>
            <Col md={2} className="text-end">
              <small className="text-muted">
                Showing {filteredTickets.length} of {supportTickets.length} tickets
              </small>
            </Col>
          </Row>


          <Row>
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                  <h5 className="mb-0">Support Requests</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Customer Name</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">Loading tickets...</td>
                        </tr>
                      ) : filteredTickets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            {searchTerm ? 'No tickets found matching your search.' : 'No support tickets found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((ticket, index) => (
                          <tr key={index}>
                            <td>
                              <strong>#{ticket.ticketId}</strong>
                            </td>
                            <td>{ticket.user.name}</td>
                            <td>{ticket.subject}</td>
                            <td>{getStatusBadge(ticket.status)}</td>
                            <td>
                              {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                            </td>
                            <td>
                              {ticket.createdAt
                                ? new Date(ticket.createdAt).toLocaleDateString()
                                : '-'}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewDetail(ticket)}
                              >
                                View Detail
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-2"
                                onClick={() => openStatusModal(ticket)}
                              >
                                Update Status
                              </Button>
                              <Button variant="outline-success" size="sm" onClick={() => openResponseModal(ticket)}>
                                Respond
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Response Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Respond to Support Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedTicket && (
              <div>
                <p>
                  <strong>Ticket ID:</strong> {selectedTicket.ticketId}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedTicket.user.name}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedTicket.subject}
                </p>
                <p>
                  <strong>Description:</strong> {selectedTicket.description}
                </p>

                <Form.Group className="mt-3">
                  <Form.Label>Response</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Type your response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendResponse}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Response'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Status Update Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Ticket Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedTicketForStatus && (
              <div>
                <p>
                  <strong>Ticket ID:</strong> #{selectedTicketForStatus.ticketId}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedTicketForStatus.user.name}
                </p>
                <p>
                  <strong>Subject:</strong> {selectedTicketForStatus.subject}
                </p>
                <p>
                  <strong>Current Status:</strong> {getStatusBadge(selectedTicketForStatus.status)}
                </p>

                <Form.Group className="mt-3">
                  <Form.Label>New Status</Form.Label>
                  <Form.Select id="newStatusSelect">
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const newStatus = document.getElementById("newStatusSelect").value;
                handleUpdateStatus(newStatus);
              }}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}

export default StaffSupport
