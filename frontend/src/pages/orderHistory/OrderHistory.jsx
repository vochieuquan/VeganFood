import React, { useEffect, useState } from 'react';
import { getOrderList } from '../../api/order';
import {
  Container, Row, Col, Card, Table, Button, Badge, Form, Pagination
} from 'react-bootstrap';
import {
  Eye, ClockHistory, Funnel, ArrowCounterclockwise
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PAGE_SIZE = 5;

const statusVariant = (status) => {
  if (!status) return { text: 'N/A', variant: 'secondary', className: 'status-unknown' };
  
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'pending':
      return { text: 'Pending', variant: 'warning', className: 'status-pending' };
    case 'paid':
      return { text: 'Paid', variant: 'info', className: 'status-paid' };
    case 'shipping':
    case 'shipped':
      return { text: 'Shipping', variant: 'primary', className: 'status-shipping' };
    case 'delivered':
      return { text: 'Delivered', variant: 'success', className: 'status-delivered' };
    case 'cancelled':
      return { text: 'Cancelled', variant: 'danger', className: 'status-cancelled' };
    case 'completed':
      return { text: 'Completed', variant: 'success', className: 'status-completed' };
    default:
      return { 
        text: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(), 
        variant: 'secondary', 
        className: 'status-default' 
      };
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0₫';
  return amount.toLocaleString('vi-VN') + '₫';
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // State for validation
  const [dateError, setDateError] = useState('');
  const [amountError, setAmountError] = useState('');

  // Filters
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Validate date range
  const validateDateRange = (from, to) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    // Check if start date is valid
    if (from && !fromDate) {
      setDateError('Invalid start date format');
      return false;
    }

    // Check if end date is valid
    if (to && !toDate) {
      setDateError('Invalid end date format');
      return false;
    }

    // Check if start date is in the future
    if (fromDate && fromDate > today) {
      setDateError('Cannot select future date');
      return false;
    }

    // Check if end date is before start date
    if (fromDate && toDate && fromDate > toDate) {
      setDateError('End date cannot be before start date');
      return false;
    }

    setDateError('');
    return true;
  };

  // Parse date string in dd/mm/yyyy format to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    if (day && month && year) {
      // Note: month is 0-indexed in JavaScript Date
      return new Date(year, month - 1, day);
    }
    return null;
  };

  // Validate date string format (dd/mm/yyyy)
  const isValidDate = (dateStr) => {
    if (!dateStr) return true; // Empty is valid
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  // Handle date input change
  const handleDateInputChange = (type, value) => {
    // Only allow numbers and slashes
    if (value && !/^[0-9/]*$/.test(value)) return;

    // Auto-format as user types
    let formattedValue = value;
    if (value.length === 2 || value.length === 5) {
      formattedValue = value + '/';
    }

    if (type === 'from') {
      setOrderDateFrom(formattedValue);
      if (orderDateTo) {
        validateDateRange(formattedValue, orderDateTo);
      } else {
        setDateError('');
      }
    } else {
      setOrderDateTo(formattedValue);
      if (orderDateFrom) {
        validateDateRange(orderDateFrom, formattedValue);
      } else {
        setDateError('');
      }
    }
  };

  // Handle date input blur - validate format
  const handleDateBlur = (type, value) => {
    if (!value) return;

    if (!isValidDate(value)) {
      setDateError('Please enter a valid date in dd/mm/yyyy format');
      return;
    }

    // If we get here, the date is valid, so validate the range
    if (type === 'from') {
      validateDateRange(value, orderDateTo);
    } else {
      validateDateRange(orderDateFrom, value);
    }
  };

  // Handle amount change
  const handleAmountChange = (type, value) => {
    const numValue = value === '' ? '' : parseFloat(value);

    if (type === 'min') {
      setMinTotal(value);
      if (value !== '' && maxTotal !== '' && numValue > parseFloat(maxTotal)) {
        setAmountError('Maximum value must be greater than or equal to minimum value');
      } else {
        setAmountError('');
      }
    } else {
      setMaxTotal(value);
      if (value !== '' && minTotal !== '' && parseFloat(minTotal) > numValue) {
        setAmountError('Maximum value must be greater than or equal to minimum value');
      } else {
        setAmountError('');
      }
    }
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders...');
        const response = await getOrderList();
        console.log('Raw API response:', response);

        if (!response || !Array.isArray(response)) {
          console.error('Invalid response format:', response);
          return;
        }

        // Map and sort orders by orderDate in descending order (newest first)
        const mapped = response
          .map(order => {
            // Convert status to lowercase for consistent comparison
            const status = order.status.toLowerCase();
            let displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

            // Handle 'shipped' status from API - map to 'Shipping' for display
            if (status === 'shipped') {
              displayStatus = 'Shipping';
            }

            return {
              id: order.orderId,
              userName: order.userName,
              orderDate: order.createdAt,
              status: displayStatus,
              paymentMethod: order.paymentMethod,
              totalAmount: order.totalAmount,
              phoneNumber: order.phoneNumber,
              address: order.address,
              items: order.items
            };
          })
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        setOrders(mapped);
        setFilteredOrders(mapped);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Convert dd/mm/yyyy to yyyy-mm-dd for date comparison
    const formatDateForComparison = (dateStr) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    if (orderDateFrom && isValidDate(orderDateFrom)) {
      const fromDate = formatDateForComparison(orderDateFrom);
      filtered = filtered.filter(o => {
        const orderDate = o.orderDate.split('T')[0]; // Get YYYY-MM-DD part
        return orderDate >= fromDate;
      });
    }

    if (orderDateTo && isValidDate(orderDateTo)) {
      const toDate = formatDateForComparison(orderDateTo);
      filtered = filtered.filter(o => {
        const orderDate = o.orderDate.split('T')[0]; // Get YYYY-MM-DD part
        return orderDate <= toDate;
      });
    }
    if (minTotal) {
      filtered = filtered.filter(o => o.totalAmount >= parseFloat(minTotal));
    }
    if (maxTotal) {
      filtered = filtered.filter(o => o.totalAmount <= parseFloat(maxTotal));
    }
    if (status) {
      filtered = filtered.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }
    if (paymentMethod) {
      filtered = filtered.filter(o => o.paymentMethod.toLowerCase() === paymentMethod.toLowerCase());
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orderDateFrom, orderDateTo, minTotal, maxTotal, status, paymentMethod, orders]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="order-history-bg" style={{ zoom: 0.8 }}>
      <Header />
      <Container className="flex-grow-1 d-flex flex-column align-items-center py-5" style={{ marginTop: '80px', flex: '1 0 auto' }}>
        <Card className="order-history-card-new p-4 w-100" style={{ maxWidth: 1300, borderRadius: 32 }}>
          <Card.Body>
            <h2 className="mb-4 text-center">
              Order History
            </h2>

            {/* Filters */}
            <div className="filter-card mb-4 p-3 rounded-3" style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                <div className="d-flex align-items-center">
                  <Funnel size={22} className="me-2" />
                  <h5 className="mb-0 fw-bold">FILTER ORDERS</h5>
                </div>
                <Button variant="link" onClick={() => {
                  setOrderDateFrom('');
                  setOrderDateTo('');
                  setMinTotal('');
                  setMaxTotal('');
                  setStatus('');
                  setPaymentMethod('');
                }}>
                  <ArrowCounterclockwise size={16} className="me-1" />
                  Reset
                </Button>
              </div>
              <Form>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Date Range</Form.Label>
                      <div className="d-flex align-items-center">
                        <div className="position-relative flex-grow-1">
                          <Form.Control
                            type="text"
                            placeholder="dd/mm/yyyy"
                            value={orderDateFrom}
                            onChange={e => handleDateInputChange('from', e.target.value)}
                            onBlur={(e) => handleDateBlur('from', e.target.value)}
                            isInvalid={!!dateError}
                            className="w-100"
                            maxLength={10}
                          />
                        </div>
                        <span className="mx-2">-</span>
                        <div className="position-relative flex-grow-1">
                          <Form.Control
                            type="text"
                            placeholder="dd/mm/yyyy"
                            value={orderDateTo}
                            onChange={e => handleDateInputChange('to', e.target.value)}
                            onBlur={(e) => handleDateBlur('to', e.target.value)}
                            isInvalid={!!dateError}
                            className="w-100"
                            maxLength={10}
                          />
                        </div>
                      </div>
                      {dateError && (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                          {dateError}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Payment</Form.Label>
                      <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="">All Methods</option>
                        <option value="Cash">Cash</option>
                        <option value="VNPAY">PayOS online payment</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Total Amount</Form.Label>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            placeholder="Min"
                            value={minTotal}
                            onChange={e => handleAmountChange('min', e.target.value)}
                            min="0"
                            step="1000"
                            className="flex-grow-1"
                          />
                          <span className="mx-2">-</span>
                          <Form.Control
                            type="number"
                            placeholder="Max"
                            value={maxTotal}
                            onChange={e => handleAmountChange('max', e.target.value)}
                            isInvalid={!!amountError}
                            min={minTotal || '0'}
                            step="1000"
                            className="flex-grow-1"
                          />
                        </div>
                        {amountError && (
                          <Form.Text className="text-danger" style={{ fontSize: '0.875em' }}>
                            {amountError}
                          </Form.Text>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <Table className="order-history-table align-middle text-center" bordered hover style={{ width: '100%', background: '#FFFBE6', minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 70, padding: '18px 10px' }}>NO</th>
                    <th style={{ minWidth: 140, padding: '18px 18px' }}>
                      Order Time
                      <div className="date-format-hint">(mm/dd/yyyy)</div>
                    </th>
                    <th style={{ minWidth: 120, padding: '18px 18px' }}>Total</th>
                    <th style={{ minWidth: 120, padding: '18px 18px' }}>Status</th>
                    <th style={{ minWidth: 120, padding: '18px 18px' }}>Payment</th>
                    <th style={{ minWidth: 90, padding: '18px 18px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">No matching orders</td>
                    </tr>
                  )}
                  {paginatedOrders.map((order, index) => (
                    <tr key={order.id} className="order-row">
                      <td className="rounded-cell-left text-muted" style={{ padding: '16px 10px' }}>
                        {index + 1 + (currentPage - 1) * PAGE_SIZE}
                      </td>
                      <td style={{ padding: '16px 18px' }}>{formatDateTime(order.orderDate)}</td>
                      <td style={{ padding: '16px 18px' }}><span className="fw-bold text-success">{formatCurrency(order.totalAmount)}</span></td>
                      <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                        <Badge
                          bg={statusVariant(order.status).variant}
                          className={`status-badge ${statusVariant(order.status).className}`}
                          style={{
                            padding: '0.5rem 1.5rem',
                            fontSize: '1rem',
                            minWidth: '120px',
                            textAlign: 'center',
                            border: 'none',
                            fontWeight: '600',
                            borderRadius: '20px'
                          }}
                        >
                          {statusVariant(order.status).text}
                        </Badge>
                      </td>
                      <td style={{ padding: '16px 18px' }}>{order.paymentMethod}</td>
                      <td className="rounded-cell-right action-cell" style={{ padding: '16px 18px' }}>
                        <Button
                          variant="outline-primary"
                          className="d-flex align-items-center justify-content-center"
                          onClick={() => navigate(`/account/orders/${order.id}`)}
                          style={{
                            width: '40px',
                            height: '40px',
                            padding: '0',
                            borderRadius: '50%',
                            border: '2px solid #FCCD2A',
                            backgroundColor: '#FFFBE6',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FCCD2A';
                            e.currentTarget.style.borderColor = '#FCCD2A';
                            e.currentTarget.querySelector('svg').style.color = '#2D6A23';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFBE6';
                            e.currentTarget.style.borderColor = '#FCCD2A';
                            e.currentTarget.querySelector('svg').style.color = '#2D6A23';
                          }}
                        >
                          <Eye size={20} style={{ color: '#2D6A23', transition: 'color 0.3s ease' }} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3 px-2 flex-wrap">
              <div className="text-muted" style={{ fontSize: '0.98rem' }}>
                {totalPages === 1
                  ? `Showing ${filteredOrders.length} of ${filteredOrders.length} orders`
                  : `Showing ${filteredOrders.length === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1} to ${Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of ${filteredOrders.length} orders`}
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="page-link-custom"
                >
                  First
                </Pagination.First>
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-link-custom"
                >
                  Prev
                </Pagination.Prev>
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={currentPage === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className="page-item-custom"
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-link-custom"
                >
                  Next
                </Pagination.Next>
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="page-link-custom"
                >
                  Last
                </Pagination.Last>
              </Pagination>
            </div>

          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
};

export default OrderHistory;
