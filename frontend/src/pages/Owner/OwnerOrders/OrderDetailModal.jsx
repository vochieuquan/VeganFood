"use client"
import "./OrderDetailModal.css"

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "✅"
      case "Pending":
        return "⏳"
      case "In Progress":
        return "🔄"
      case "Cancelled":
        return "❌"
      default:
        return "❓"
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed"
      case "Pending":
        return "status-pending"
      case "In Progress":
        return "status-progress"
      case "Cancelled":
        return "status-cancelled"
      default:
        return ""
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Order Detail</h2>
        <p><strong>Order ID:</strong> #{order.id}</p>
        <p><strong>Customer:</strong> {order.customer}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>Order Date:</strong> {order.orderDate}</p>
        <p><strong>Time:</strong> {order.time}</p>
        <p><strong>Payment Method:</strong> {order.payment}</p>
        <p><strong>Discount Code:</strong> {order.discountCode || "N/A"}</p>
        <p><strong>Items:</strong> {order.items}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p>
          <strong>Status:</strong>
          <span className={`status-container ${getStatusClass(order.status)}`}>
            <span className="status-icon-box">{getStatusIcon(order.status)}</span>
            <span className="status-badge">{order.status}</span>
          </span>
        </p>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default OrderDetailModal
