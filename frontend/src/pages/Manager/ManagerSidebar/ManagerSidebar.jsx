"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./ManagerSidebar.module.css"
import Logo from "../../../assets/image/Logo.png"

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

const LogOut = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const ManagerSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)

  const handleItemClick = (path) => {
    setActiveItem(path)
    navigate(path)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <img src={Logo || "/placeholder.svg"} alt="Logo" className={styles.logo} />
          <div className={styles.brandInfo}>
            <span className={styles.userRole}>Manager</span>
          </div>
        </div>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          <li
            className={`${styles.menuItem} ${activeItem === "/manager-dashboard" ? styles.active : ""}`}
            onClick={() => handleItemClick("/manager-dashboard")}
          >
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </li>
          <li
            className={`${styles.menuItem} ${activeItem === "/manager-food" ? styles.active : ""}`}
            onClick={() => handleItemClick("/manager-food")}
          >
            <UtensilsCrossed size={20} />
            <span>Food Management</span>
          </li>
          <li
            className={`${styles.menuItem} ${activeItem === "/manager-orders" ? styles.active : ""}`}
            onClick={() => handleItemClick("/manager-orders")}
          >
            <ShoppingCart size={20} />
            <span>Order Management</span>
          </li>
          <li
            className={`${styles.menuItem} ${activeItem === "/manager-profile" ? styles.active : ""}`}
            onClick={() => handleItemClick("/manager-profile")}
          >
            <User size={20} />
            <span>Manager Profile</span>
          </li>
        </ul>

        <button
          className={`${styles.logoutBtn} ${activeItem === "/manager-logout" ? styles.active : ""}`}
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

export default ManagerSidebar