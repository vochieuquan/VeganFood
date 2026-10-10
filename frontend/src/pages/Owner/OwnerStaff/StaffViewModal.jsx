import React from "react";
import "./StaffModal.css";

const StaffViewModal = ({ staff, onClose }) => {
  if (!staff) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Staff Details</h2>
        <p><strong>User ID:</strong> {staff.userId}</p>
        <p><strong>Name:</strong> {staff.name}</p>
        <p><strong>Email:</strong> {staff.email}</p>
        <p><strong>Role:</strong> {staff.role}</p>
        <p><strong>Phone Number:</strong> {staff.phoneNumber || 'N/A'}</p>
        <p><strong>Address:</strong> {staff.address || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {staff.dateOfBirth || 'N/A'}</p>
        <p><strong>Gender:</strong> {staff.gender || 'N/A'}</p>
        <p><strong>Created At:</strong> {staff.createdAt ? new Date(staff.createdAt).toLocaleString() : 'N/A'}</p>
        <div className="modal-actions center">
          <button onClick={onClose} className="btn-modal-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffViewModal;
