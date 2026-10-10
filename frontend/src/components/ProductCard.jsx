import React from "react"
import { Card, Badge, Button } from "react-bootstrap"
import { ShoppingCart } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "../api/config"
import { useCart } from '../context/CartContext'
import "./ProductCard.css"

const ProductCard = ({ product }) => {
  const { showNotification } = useCart()

  const handleCardClick = () => {
    window.location.href = `/foodDetail/${product.product_id}`
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    const token = localStorage.getItem("token")

    if (!token) {
      alert("❌ You must be logged in to add products to the cart.")
      return
    }

    try {
      await axios.post(
        `${BASE_URL}/api/cart/items/add?productId=${encodeURIComponent(product.product_id)}&quantity=1`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Axios resolves for all successful 2xx responses, including 201 Created.
      showNotification(product)
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("❌ Failed to add product to cart.")
    }
  }

  return (
    <Card
      className="h-100 border-0 shadow-sm product-card-hover"
      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="position-relative overflow-hidden">
        <div className="product-image-container">
          <Card.Img
            variant="top"
            src={product.image_url || product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            className="product-image"
          />
        </div>
      </div>

      {/* Product Info */}
      <Card.Body className="p-4">
        <div className="mb-2">
          {product.category && (
            <Badge bg="success" className="mb-2 px-2 py-1 small">
              {product.category}
            </Badge>
          )}
        </div>

        <Card.Title className="h6 fw-bold text-dark mb-2 lh-sm" style={{ height: "2.5rem" }}>
          {product.name && product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
        </Card.Title>

        {/* Stock & Sold */}
        <div className="d-flex align-items-center mb-3" style={{ fontWeight: 600 }}>
          <div className="d-flex align-items-center" style={{ flex: 1 }}>
            <h6 className="text-danger fw-bold mb-0">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
            </h6>
          </div>
          <div className="text-end" style={{ flex: 1, color: '#6c757d', fontWeight: 650, fontSize: '1rem' }}>
            {product.total_order} sold
          </div>
        </div>

        {/* Description */}
        <p className="text-muted small mb-3" style={{ height: "2.5rem" }}>
          {product.description && product.description.length > 60
            ? `${product.description.substring(0, 60)}...`
            : product.description}
        </p>

        {/* Add to Cart */}
        <Button
          variant="outline-success"
          size="sm"
          className="w-100"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={14} className="me-2" />
          Add to Cart
        </Button>
      </Card.Body>
    </Card>
  )
}

export default ProductCard
