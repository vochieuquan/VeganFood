import React, { useEffect, useState, useRef } from "react"
import { Container, Navbar, Form, InputGroup, Button, ListGroup } from "react-bootstrap"
import { Search, User, Phone, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BASE_URL } from "../api/config"
import "./Header.css"
import logoImage from "../assets/image/Logo.png"

const Header = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [allProducts, setAllProducts] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) setUser(JSON.parse(userData))
    else setUser(null)
  }, [])

  // Logout (if needed)
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem('token');
    setUser(null)
    navigate("/")
  }

  const handleCartClick = () => {
    window.location.href = '/cart'
  }

  const handleLoginClick = () => {
    window.location.href = '/login'
  }

  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products`)
        setAllProducts(response.data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchAllProducts()
  }, [])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query)
    )
    setSearchResults(filtered)
    setShowResults(filtered.length > 0)
  }, [searchQuery, allProducts])

  const handleResultClick = (productId) => {
    navigate(`/foodDetail/${productId}`)
    setShowResults(false)
    setSearchQuery("")
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="main-header">
      <Navbar expand="lg" className="main-navbar">
        <Container>
          {/* Logo Section */}
          <Navbar.Brand href="/" className="brand-logo">
            <div className="logo-container">
              <img
                src={logoImage}
                alt="Logo"
                className="logo-image"
                style={{ height: "80px", width: "auto", maxWidth: "200px" }}
              />
            </div>
          </Navbar.Brand>

          {/* Hotline Section */}
          <div className="hotline-section">
            <div className="hotline-icon">
              <Phone size={20} />
            </div>
            <div className="hotline-content">
              <div className="hotline-number">1900-6066</div>
              <div className="hotline-text">Fast delivery</div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section position-relative" ref={searchRef}>
            <Form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search vegetarian dishes..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(searchResults.length > 0)}
                />
                <Button
                  variant="success"
                  className="search-btn"
                  type="submit"
                >
                  <Search size={30} />
                </Button>
              </InputGroup>
            </Form>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div
                className="search-results-dropdown position-absolute w-100 bg-white shadow-lg rounded mt-1"
                style={{
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem'
                }}
              >
                <ListGroup variant="flush">
                  {searchResults.map((product) => (
                    <ListGroup.Item
                      key={product.product_id}
                      action
                      onClick={() => handleResultClick(product.product_id)}
                      className="py-2 hover-bg-light"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginRight: '10px'
                          }}
                        />
                        <div>
                          <div className="fw-medium">{product.name}</div>
                          <small className="text-muted">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD'
                            }).format(product.price)}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="user-actions">
            <Button variant="outline-success" className="cart-btn" onClick={handleCartClick}>
              <ShoppingCart size={18} className="me-2" />
              <span className="cart-text">Cart</span>
            </Button>
            {!user ? (
              <Button variant="success" className="auth-btn" onClick={handleLoginClick}>
                <User size={16} className="me-2" />
                <span className="auth-text">Login</span>
              </Button>

            ) : (
              <div className="d-inline-flex align-items-center ms-2">
                <img
                  src={user.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt="avatar"
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8, cursor: "pointer" }}
                  onClick={() => window.location.href = "/account/profile"}
                />
                <span
                  className="me-2 fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => window.location.href = "/account/profile"}
                >
                  {user.name || "User"}
                </span>

                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>



              </div>
            )}
          </div>
        </Container>
      </Navbar>
    </header>
  )
}

export default Header
