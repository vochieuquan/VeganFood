"use client"

import { useState, useEffect } from "react"
import Sidebar from "../OwnerSidebar/OwnerSidebar.jsx"
import CustomerViewModal from "./CustomerViewModal.jsx"
import "./ManageCustomers.css"
import { getCustomers } from "../../../api/user";

const ManageCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewCustomer, setViewCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // Gọi API getCustomers khi component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = () => {
    localStorage.removeItem("token")
    // navigate("/login")
  }

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this customer?")
    if (confirmed) {
      const updated = customers.filter((c) => c.userId !== id)
      setCustomers(updated)
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Header với Sidebar */}
      <header className="dashboard-header">
        <Sidebar />
        <div className="header-container">
          <div className="header-left"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content main-content">
        <div className="manage-customers">
          {/* Add Customer Button */}
          {/* <div className="page-actions">
            <button className="add-btn">
              <span className="add-icon">➕</span>
              Add Customer
            </button>
          </div> */}

          {/* Search */}
          <div className="search-card">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Customer Stats */}
          <div className="stats-row">
            {[
              { label: "Total Customers", value: customers.length, color: "blue" },
              {
                label: "Active This Month",
                value: customers.filter((c) => new Date(c.createdAt) > new Date("2024-01-01")).length,
                color: "green",
              },
            ].map((stat, index) => (
              <div key={index} className="mini-stat">
                <div className="mini-stat-value">{stat.value}</div>
                <div className={`mini-stat-label color-${stat.color}`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Customer List */}
          <div className="table-card">
            <div className="table-container">
              <table className="data-table">
                <thead className="table-header">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.userId} className="table-row">
                      <td>
                        <div className="user-info">
                          <div className="user-id">{customer.userId}</div>

                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{customer.name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-email">{customer.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-phone">{customer.phoneNumber}</div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="action-btn edit"
                          title="View Customer"
                          onClick={() => setViewCustomer(customer)}
                          style={{ color: '#fff', background: '#347928', minWidth: 80, minHeight: 32, fontWeight: 600 }}
                        >
                          <span>View</span>
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {viewCustomer && (
        <CustomerViewModal
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
        />
      )}
    </div>
  )
}

export default ManageCustomers
