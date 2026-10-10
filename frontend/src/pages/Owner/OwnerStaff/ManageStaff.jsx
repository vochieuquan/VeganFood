"use client"

import { useState, useEffect } from "react"
import Sidebar from "../OwnerSidebar/OwnerSidebar.jsx"
import StaffViewModal from "./StaffViewModal"
import StaffEditModal from "./StaffEditModal"
import "./ManageStaff.css"
import "./StaffModal.css"
import { getEmployees, createEmployee, deleteUser } from "../../../api/user";

const ManageStaff = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [staffMembers, setStaffMembers] = useState([])

  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Thêm state để điều khiển modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    phoneNumber: "",
    address: ""
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getEmployees();
        setStaffMembers(data);
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    fetchStaff();
  }, []);

  const handleView = (staff) => {
    setSelectedStaff(staff)
    setIsViewModalOpen(true)
  }

  // const handleEdit = (staff) => {
  //   setSelectedStaff(staff)
  //   setIsEditModalOpen(true)
  // }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const response = await deleteUser(id);
        alert(response.message || 'Delete staff member successfully!');
        window.location.reload();
      } catch (err) {
        alert('Delete staff member failed!');
        console.error('Delete staff error:', err);
      }
    }
  }

  const handleUpdate = (updatedStaff) => {
    const updatedList = staffMembers.map((staff) =>
      staff.userId === updatedStaff.userId ? updatedStaff : staff
    )
    setStaffMembers(updatedList)
    setIsEditModalOpen(false)
  }

  const filteredStaff = staffMembers.filter((staff) => {
    console.log(staff);

    return [staff.userId, staff.name, staff.email, staff.role, staff.phoneNumber, staff.createdAt, staff.address, staff.dateOfBirth, staff.gender]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  })

  const handleOpenAddModal = () => {
    setNewEmployee({
      name: "",
      email: "",
      password: "",
      role: "staff",
      phoneNumber: "",
      address: ""
    });
    setIsAddModalOpen(true);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newEmployee);
      alert('Add employee successfully!');
      window.location.reload();
    } catch (err) {
      alert('Add employee failed!');
      console.error('Add employee error:', err);
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <Sidebar />
        <div className="header-container" />
      </header>

      <main className="dashboard-content main-content">
        <div className="manage-staff">
          {/* Action Button */}
          <div className="page-actions">
            <button className="add-btn" onClick={handleOpenAddModal}>
              <span className="add-icon">➕</span> Add Employee
            </button>
          </div>

          {/* Staff Stats */}
          <div className="stats-row">
            {[
            ].map((stat, i) => (
              <div key={i} className="mini-stat">
                <div className="mini-stat-value">{stat.value}</div>
                <div className={`mini-stat-label color-${stat.color}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="search-card">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Staff Table */}
          <div className="table-card">
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.userId} className="table-row">
                      <td>
                        <div className="user-id">{staff.userId}</div>
                      </td>
                      <td>
                        <div className="user-name">{staff.name}</div>
                      </td>
                      <td>{staff.role || 'N/A'}</td>
                      <td>
                        <div className="user-info">
                          <div className="user-email">{staff.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-phone">{staff.phoneNumber}</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" onClick={() => handleView(staff)}>👁️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStaff.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h4>No staff members found</h4>
                <p>No staff match your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* View Modal */}
      {isViewModalOpen && selectedStaff && (
        <StaffViewModal staff={selectedStaff} onClose={() => setIsViewModalOpen(false)} />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedStaff && (
        <StaffEditModal
          staff={selectedStaff}
          onUpdate={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
          <div className="modal-box">
            <h2>Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  id="name"
                  type="text"
                  value={newEmployee.name} 
                  onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} 
                  placeholder="Enter full name"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={newEmployee.email} 
                  onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} 
                  placeholder="Enter email address"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password"
                  type="password" 
                  value={newEmployee.password} 
                  onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} 
                  placeholder="Create a strong password"
                  minLength="6"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={newEmployee.role}
                  onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input 
                  id="phoneNumber"
                  type="tel"
                  value={newEmployee.phoneNumber} 
                  onChange={e => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  value={newEmployee.address} 
                  onChange={e => setNewEmployee({ ...newEmployee, address: e.target.value })}
                  placeholder="Enter full address"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9375rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '44px',
                    backgroundColor: '#f9fafb',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageStaff
