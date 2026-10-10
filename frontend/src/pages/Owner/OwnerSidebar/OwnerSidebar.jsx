"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OwnerSidebar.css";

const BarChart3 = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

const User = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UtensilsCrossed = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 3h.01M4 7h.01M4 11h.01M10 4v4a2 2 0 0 1-2 2H6l4 12" />
    <path d="M16 2l6 6m-6 0l6-6M14 15l-3-3 8-8 3 3z" />
  </svg>
);

const ShoppingCart = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const LogOut = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const OwnerSidebar = ({ onLogout, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={process.env.PUBLIC_URL + '/Logo.png' || '/placeholder.svg'} alt="Logo" className="logo" />
          <div className="brand-info">
            <span className="user-role">Owner</span>
          </div>
        </div>
      </div>
      <nav>
        <ul>
          <li
            className={`menu-item ${activeItem === "/manager-dashboard" ? "active" : ""}`}
            onClick={() => handleItemClick("/owner-dashboard")}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/manage-customers" ? "active" : ""}`}
            onClick={() => handleItemClick("/owner-customermanagement")}
          >
            <UtensilsCrossed size={20} />
            <span>Customer Management</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/manage-orders" ? "active" : ""}`}
            onClick={() => handleItemClick("/owner-ordersmanagement")}
          >
            <ShoppingCart size={20} />
            <span>Orders Management</span>
          </li>
          <li
            className={`menu-item ${activeItem === "/manage-staff" ? "active" : ""}`}
            onClick={() => handleItemClick("/owner-staffmanagement")}
          >
            <User size={20} />
            <span>Employee Management</span>
          </li>
        </ul>
        <button
          className={`logout-btn ${activeItem === "/manager-logout" ? "active" : ""}`}
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
  );
};

export default OwnerSidebar;
