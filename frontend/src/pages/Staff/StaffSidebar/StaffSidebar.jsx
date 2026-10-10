"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./StaffSidebar.css"
import Logo from "../../../assets/image/Logo.png"

// Icon components
const BarChart3 = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
)

const User = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const UtensilsCrossed = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 2l6 6m-6 0l6-6M4 3h.01M4 7h.01M4 11h.01M10 4v4a2 2 0 0 1-2 2H6l4 12" />
    <path d="M14 15l-3-3 8-8 3 3z" />
  </svg>
)

const ShoppingCart = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const Headphones = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2z" />
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
  </svg>
)

const LogOut = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const StaffSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)

  const handleItemClick = (path) => {
    navigate(path)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={Logo || "/placeholder.svg"} alt="Logo" className="logo" />
          <div className="brand-info">
            <span className="user-role">Staff</span>
          </div>
        </div>
      </div>
      <nav>
        <ul>
          <li
            className={`menu-item ${activeItem === "/staff-dashboard" ? "active" : ""}`}
            onClick={() => handleItemClick("/staff-dashboard")}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/staff-orders" ? "active" : ""}`}
            onClick={() => handleItemClick("/staff-orders")}
          >
            <ShoppingCart size={20} />
            <span>Order Management</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/staff-food" ? "active" : ""}`}
            onClick={() => handleItemClick("/staff-food")}
          >
            <UtensilsCrossed size={20} />
            <span>Food List</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/staff-support" ? "active" : ""}`}
            onClick={() => handleItemClick("/staff-support")}
          >
            <Headphones size={20} />
            <span>Customer Support</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/staff-profile" ? "active" : ""}`}
            onClick={() => handleItemClick("/staff-profile")}
          >
            <User size={20} />
            <span>Staff Profile</span>
          </li>
        </ul>
        <button
          className={`logout-btn`}
          onClick={() => {
            localStorage.removeItem("user")
            localStorage.removeItem("token")
            navigate("/")
          }}
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  )
}

export default StaffSidebar
