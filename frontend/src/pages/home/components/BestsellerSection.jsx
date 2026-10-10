"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Badge, Spinner, Alert } from "react-bootstrap"
import { Crown, TrendingUp, FlameIcon as Fire, Award, Zap } from "lucide-react"
import { getBestsellerProducts } from "../../../api/product"
import ProductCard from "../../../components/ProductCard"
import "./BestsellerSection.css"

const BestsellerSection = () => {
  const [bestsellerProducts, setBestsellerProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const response = await getBestsellerProducts()

        if (Array.isArray(response)) {
          // Chuyển đổi định dạng để phù hợp với ProductCard
          const transformed = response.map((item) => ({
            product_id: item.productId,
            name: item.name,
            image_url: item.imageUrl,
            category: item.category,
            description: item.description,
            total_order: item.totalOrdered,
            price: item.price,
          }))

          setBestsellerProducts(transformed)
        } else {
          setError("Invalid response format.")
        }
      } catch (error) {
        console.error("Failed to fetch bestsellers:", error)
        setError("Failed to load bestsellers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBestsellers()
  }, [])

  if (loading) {
    return (
      <div className="bestseller-loading">
        <div className="loading-container">
          <Spinner animation="border" variant="success" className="loading-spinner" />
          <p className="loading-text">Loading amazing dishes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <section id="best-seller" className="bestseller-section py-5">
      <div className="bestseller-bg-pattern"></div>
      <Container>
        <div className="category-content">
          <div className="bestseller-header">
            <div className="bestseller-title-wrapper">
              <div className="crown-container">
                <Crown size={40} className="bestseller-crown rotating" />
                <div className="crown-glow"></div>
              </div>
              <Badge className="bestseller-badge">
                <Award size={16} className="me-2" />
                Bestsellers
                <Zap size={16} className="ms-2" />
              </Badge>
              <div className="crown-container">
                <Crown size={40} className="bestseller-crown rotating-reverse" />
                <div className="crown-glow"></div>
              </div>
            </div>

            <h2 className="bestseller-title">
              <span className="title-gradient">Most Popular</span>
              <br />
              <span className="title-accent">Dishes</span>
            </h2>

            <p className="bestseller-subtitle">
              Discover our customers' favorite vegan dishes that have won hearts and taste buds
            </p>

            <div className="bestseller-trending">
              <div className="trending-container">
                <TrendingUp size={24} className="trending-icon" />
                <span className="trending-text">Trending Now</span>
                <Fire size={20} className="fire-icon" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <Row className="g-4 bestseller-grid">
            {bestsellerProducts.map((product, index) => (
              <Col lg={3} md={6} key={product.product_id}>
                <div className="bestseller-product-wrapper">
                  {/* Rank Badge */}
                  <div className="bestseller-rank-container">
                    <Badge className={`bestseller-rank-badge rank-${index + 1}`}>
                      <Crown size={12} className="rank-crown" />#{index + 1}
                    </Badge>
                  </div>

                  {/* Hot Badge */}
                  <div className="bestseller-hot-badge">
                    <Fire size={16} className="hot-icon" />
                    <span>HOT</span>
                  </div>

                  {/* Card */}
                  <div className="product-card-container">
                    <ProductCard product={product} />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </section>
  )
}

export default BestsellerSection
