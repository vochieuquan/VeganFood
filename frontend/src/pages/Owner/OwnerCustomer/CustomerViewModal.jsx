// src/Owner/OwnerCustomer/CustomerViewModal.jsx
import "./CustomerViewModal.css"

const CustomerViewModal = ({ customer, onClose }) => {
  if (!customer) return null

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Customer Details</h2>
        <p><strong>User ID:</strong> {customer.userId}</p>
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone Number:</strong> {customer.phoneNumber || 'N/A'}</p>
        <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {customer.dateOfBirth || 'N/A'}</p>
        <p><strong>Gender:</strong> {customer.gender || 'N/A'}</p>
        <p><strong>Created At:</strong> {new Date(customer.createdAt).toLocaleString()}</p>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default CustomerViewModal
