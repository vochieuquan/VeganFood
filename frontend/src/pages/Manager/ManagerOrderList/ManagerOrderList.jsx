"use client"

import { useState, useEffect } from "react"
import Sidebar from "../ManagerSidebar/ManagerSidebar.jsx"
import "./ManagerOrderList.css"
import { getOrder, updateOrderStatus } from '../../../api/order';

const statusLabels = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const ManagerOrderList = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderToUpdate, setOrderToUpdate] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [newStatus, setNewStatus] = useState("")
  const [searchTerm, setSearchTerm] = useState("");

  // Gọi API khi vào trang
  useEffect(() => {
    getOrder().then(data => {
      setOrders(data);
    }).catch(() => setOrders([]));
  }, []);

  const handleUpdateStatusClick = (order) => {
    setOrderToUpdate(order)
    setNewStatus(order.status)
  }

  const handleDetailsClick = (order) => {
    setSelectedOrder(order)
  }

  // Search + filter
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.userName?.toLowerCase().includes(search) ||
      order.phoneNumber?.toLowerCase().includes(search) ||
      String(order.orderId).toLowerCase().includes(search) ||
      order.address?.toLowerCase().includes(search) ||
      order.paymentMethod?.toLowerCase().includes(search)
    );
  }).filter(order => activeFilter === "all" ? true : order.status === activeFilter);

  const handleStatusUpdate = async (e) => {
    try {
      const res = await updateOrderStatus(orderToUpdate.orderId, { status: newStatus });
      console.log(res);
      if (
        res === 'success' ||
        (res && res.success) ||
        (res && res.message === 'success') ||
        (res && res.status === 'success')
      ) {
        // Thành công
        const updatedOrders = orders.map((order) =>
          order.orderId === orderToUpdate.orderId ? { ...order, status: newStatus } : order,
        );
        setOrders(updatedOrders);
        setOrderToUpdate(null);
        alert('Order status updated successfully!');
      } else {
        alert('Update status failed!');
      }
    } catch (err) {
      alert('Update status failed!');
    }
  };

  const getStatusCount = (status) => {
    return orders.filter((order) => order.status === status).length
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <div className="order-management-header">
          <div className="header-content">
            <h3>Order Management</h3>
            <p>Manage and monitor restaurant orders</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{getStatusCount("pending")}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{getStatusCount("paid")}</span>
              <span className="stat-label">Paid</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{getStatusCount("delivered")}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>
        </div>

        <div className="order-filters">
          {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${activeFilter === status ? "active" : ""}`}
              onClick={() => setActiveFilter(status)}
            >
              {status === "all" ? "All" : statusLabels[status]}
              {status !== "all" && <span className="filter-count">({getStatusCount(status)})</span>}
            </button>
          ))}
        </div>

        <div className="order-header" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', minWidth: 400 }}
          />
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th className="col-order-id">Order ID</th>
              <th className="col-customer">Customer Name</th>
              <th className="col-payment">Payment Method</th>
              <th className="col-status">Status</th>
              <th className="col-time">Time</th>
              <th className="col-amount">Total Amount</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
        </table>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="order-table">
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td className="col-order-id">
                    <span className="order-id">#{order.orderId}</span>
                  </td>
                  <td className="col-customer">
                    <span className="customer-name">{order.userName}</span>
                  </td>
                  <td className="col-payment">
                    <span className="payment-method">{order.paymentMethod}</span>
                  </td>
                  <td className="col-status">
                    <span className={`badge status-${order.status}`}>{statusLabels[order.status] || order.status}</span>
                  </td>
                  <td className="col-time">
                    <span className="time-cell">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : '-'}</span>
                  </td>
                  <td className="col-amount">
                    <span className="total-amount">{Number(order.totalAmount || 0).toLocaleString()}đ</span>
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="detail-btn" onClick={() => handleDetailsClick(order)} title="View Details">
                        Detail
                      </button>
                      <button className="edit-btn" onClick={() => handleUpdateStatusClick(order)} title="Update Status">
                        Update Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">📋</div>
              <h4>No orders found</h4>
              <p>No orders match the selected filter</p>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="header-info">
                  <h4 className="text-white">Order Details</h4>
                </div>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="unified-details-panel">
                  {/* Customer Info */}
                  <div className="details-section">
                    <div className="section-header">
                      <span className="section-icon">👤</span>
                      <h5>Customer</h5>
                    </div>
                    <div className="section-content">
                      <div className="info-row">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{selectedOrder.userName}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">{selectedOrder.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  {/* Payment & Status */}
                  <div className="details-section">
                    <div className="section-header">
                      <span className="section-icon">💰</span>
                      <h5>Payment</h5>
                    </div>
                    <div className="section-content">
                      <div className="info-row">
                        <span className="info-label">Method:</span>
                        <span className="info-value">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Status:</span>
                        <span className={`badge status-${selectedOrder.status}`}>{statusLabels[selectedOrder.status]}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Total:</span>
                        <span className="info-value order-amount">{Number(selectedOrder.totalAmount || 0).toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                  {/* Food Items */}
                  <div className="details-section">
                    <div className="section-header">
                      <span className="section-icon">🍽️</span>
                      <h5>Items</h5>
                    </div>
                    <div className="section-content">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        <table style={{ width: '100%', background: '#f8f9fa', borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: 8 }}>Product</th>
                              <th style={{ textAlign: 'center', padding: 8 }}>Quantity</th>
                              <th style={{ textAlign: 'right', padding: 8 }}>Unit Price</th>
                              <th style={{ textAlign: 'right', padding: 8 }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: 8 }}>{item.productName}</td>
                                <td style={{ textAlign: 'center', padding: 8 }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: 8 }}>{Number(item.priceAtTime || 0).toLocaleString()}đ</td>
                                <td style={{ textAlign: 'right', padding: 8, fontWeight: 600 }}>
                                  {(Number(item.priceAtTime || 0) * Number(item.quantity || 0)).toLocaleString()}đ
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <span className="info-value">-</span>
                      )}
                    </div>
                  </div>
                  {/* Address & Time */}
                  <div className="details-section">
                    <div className="section-header">
                      <span className="section-icon">📍</span>
                      <h5>Delivery</h5>
                    </div>
                    <div className="section-content">
                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">{selectedOrder.address}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Created At:</span>
                        <span className="info-value">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {orderToUpdate && (
          <div className="modal-overlay" onClick={() => setOrderToUpdate(null)}>
            <div className="modal-content update-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="header-info">
                  <h4 className="text-white">Update Order Status</h4>
                </div>
                <button className="close-btn" onClick={() => setOrderToUpdate(null)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="current-order-info">
                  <div className="order-card">
                    <div className="order-header">
                      <div className="customer-avatar">
                        <span>{orderToUpdate?.userName ? orderToUpdate.userName.charAt(0) : ""}</span>
                      </div>
                      <div className="customer-details">
                        <h6>{orderToUpdate?.userName || "N/A"}</h6>
                        <p>{orderToUpdate?.phoneNumber || "N/A"}</p>
                        <p className="order-total">{Number(orderToUpdate?.totalAmount || 0).toLocaleString()}đ</p>
                      </div>
                    </div>
                    <div className="current-status">
                      <span className="status-label">Current Status:</span>
                      <span className={`badge status-${orderToUpdate?.status}`}>{statusLabels[orderToUpdate?.status]}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleStatusUpdate} className="status-form">
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      <span className="label-icon">🔄</span>
                      Select New Status
                    </label>
                    <div className="status-options">
                      {Object.entries(statusLabels)
                        .filter(([value]) => {
                          if (orderToUpdate?.status === 'cancelled') {
                            return false;
                          }
                          if (orderToUpdate?.status === 'delivered') {
                            return ['delivered', 'cancelled'].includes(value);
                          }
                          if (orderToUpdate?.status === 'shipped') {
                            return !['pending', 'paid'].includes(value);
                          }
                          return true;
                        })
                        .map(([value, label]) => (
                        <label key={value} className={`status-option ${newStatus === value ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="status"
                            value={value}
                            checked={newStatus === value}
                            onChange={(e) => setNewStatus(e.target.value)}
                          />
                          <span className={`status-badge status-${value}`}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setOrderToUpdate(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="update-btn">
                      <span className="btn-icon">✓</span>
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ManagerOrderList
