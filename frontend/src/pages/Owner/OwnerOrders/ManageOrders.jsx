"use client"

import { useState, useEffect } from "react"
import Sidebar from "../OwnerSidebar/OwnerSidebar.jsx"
import "./ManageOrders.css"
import "./OrderDetailModal.css"
import OrderDetailModal from "./OrderDetailModal.jsx"
import { updateOrderStatus, getOrder } from "../../../api/order"

// Modal chỉnh sửa trạng thái đơn hàng
const EditStatusModal = ({ order, onClose, onSave }) => {
  const [newStatus, setNewStatus] = useState(order.status.toLowerCase())
  const allowedStatuses = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ]
  const handleSave = () => {
    onSave({ ...order, status: newStatus })
    onClose()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Order Status</h2>
        <p><strong>Order ID:</strong> #{order.id}</p>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          style={{ width: "100%", padding: "10px", marginTop: "16px" }}
        >
          {allowedStatuses.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button className="close-btn" onClick={handleSave} style={{ marginTop: "20px" }}>
          Save
        </button>
      </div>
    </div>
  )
}

const ManageOrders = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [orderList, setOrderList] = useState([])
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrder()
        // Map API data to UI format
        const mapped = data.map(order => ({
          id: order.orderId,
          customer: order.userName,
          phone: order.phoneNumber,
          address: order.address,
          orderDate: order.createdAt ? order.createdAt.split("T")[0] : "",
          payment: order.paymentMethod,
          discountCode: order.discountCode || "",
          items: order.items && order.items.length > 0 ? order.items.map(i => `${i.productName} x${i.quantity}`).join(", ") : "",
          total: order.totalAmount,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          time: order.createdAt ? order.createdAt.split("T")[1]?.slice(0,5) : "",
        }))
        setOrderList(mapped)
      } catch (err) {
        setOrderList([])
      }
    }
    fetchOrders()
  }, [])

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "⏳"
      case "paid":
        return "💳"
      case "shipped":
        return "🚚"
      case "delivered":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "❓"
    }
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending"
      case "paid":
        return "status-paid"
      case "shipped":
        return "status-shipped"
      case "delivered":
        return "status-delivered"
      case "cancelled":
        return "status-cancelled"
      default:
        return "status-pending"
    }
  }

  const filteredOrders = orderList.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === "All" || order.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleStatusSave = async (updatedOrder) => {
    try {
      await updateOrderStatus(updatedOrder.id, { status: updatedOrder.status })
      setOrderList(orderList.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o))
    } catch (err) {
      // Optionally show an error message here
    }
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <Sidebar />
        <div className="header-container">
          <div className="header-left" />
        </div>
      </header>

      <div className="dashboard-content main-content">
        <div className="manage-orders">
          {/* Stats */}
          <div className="stats-row">
            {[
              { label: "Total Orders", value: orderList.length, color: "blue" },
              { label: "Pending", value: orderList.filter((o) => o.status.toLowerCase() === "pending").length, color: "orange" },
              { label: "Paid", value: orderList.filter((o) => o.status.toLowerCase() === "paid").length, color: "purple" },
              { label: "Shipped", value: orderList.filter((o) => o.status.toLowerCase() === "shipped").length, color: "blue" },
              { label: "Delivered", value: orderList.filter((o) => o.status.toLowerCase() === "delivered").length, color: "green" },
              { label: "Cancelled", value: orderList.filter((o) => o.status.toLowerCase() === "cancelled").length, color: "red" },
            ].map((stat, index) => (
              <div key={index} className="mini-stat">
                <div className="mini-stat-value">{stat.value}</div>
                <div className={`mini-stat-label color-${stat.color}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="search-card">
            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-input">
                  <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                <div className="filter-select">
                  <div className="select-container">
                    <span className="select-icon">🔽</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="status-select"
                    >
                      <option value="All">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th>ORDER ID</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>TIME</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td><div className="order-id">#{order.id}</div></td>
                      <td><div className="customer-name">{order.customer}</div></td>
                      <td><div className="order-items">{order.items}</div></td>
                      <td><div className="order-total">${order.total.toFixed(2)}</div></td>
                      <td>
                        <div className="order-status">
                          <span className="status-icon">{getStatusIcon(order.status)}</span>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span>
                        </div>
                      </td>
                      <td><div className="order-time">{order.time}</div></td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            title="View Order Details"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <span>👁️</span>
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
                <div className="empty-icon">📋</div>
                <h4>No orders found</h4>
                <p>No orders match your search criteria. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Modal chỉnh trạng thái */}
      {editingOrder && (
        <EditStatusModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={handleStatusSave}
        />
      )}
    </div>
  )
}

export default ManageOrders
