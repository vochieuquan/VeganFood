import React, { useState } from "react"
import "./StaffModal.css"

const StaffEditModal = ({ staff, onClose, onUpdate }) => {
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const updated = { ...staff, password }
    onUpdate(updated)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Edit Staff Password</h2>
        <form onSubmit={handleSubmit}>
          <label>New Password:</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="modal-actions">
            <button type="submit" className="btn-save">Save</button>
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffEditModal
