"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  History,
  Clock,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { getPreviouslyOrderedProducts } from "../../../api/order";
import ProductCard from "../../../components/ProductCard";
import "./PreviouslyOrderedSection.css";

const PreviouslyOrderedSection = () => {
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPreviousOrders = async () => {
    try {
      const response = await getPreviouslyOrderedProducts();
      setPreviousOrders(response.slice(0, 4)); // lấy 4 món đầu
    } catch (err) {
      console.error("Failed to fetch previous orders:", err);
      setError("Failed to load suggested products. Please check token or network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousOrders();
  }, []);

  if (loading) {
    return (
      <div className="previously-ordered-loading">
        <div className="loading-container">
          <Spinner animation="border" variant="success" className="loading-spinner" />
          <p className="loading-text">Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error || !previousOrders || previousOrders.length === 0) {
    // Don't show the section if there's an error or no previous orders
    return null;
  }

  return (
    <section id="previously-ordered" className="previously-ordered-section py-5">
      <div className="previously-ordered-bg-pattern"></div>
      <Container>
        <div className="category-content">
          {/* Section Header */}
          <div className="previously-ordered-header">
            <div className="previously-ordered-title-wrapper">
              <div className="history-container">
                <History size={36} className="history-icon" />
                <div className="history-glow"></div>
              </div>

              <Badge className="previously-ordered-badge">
                <Clock size={18} className="me-2" />
                Previously Ordered
                <CheckCircle size={18} className="ms-2" />
              </Badge>

              <div className="clock-container">
                <RotateCcw size={36} className="clock-icon" />
                <div className="clock-glow"></div>
              </div>
            </div>

            <h2 className="previously-ordered-title">
              <span className="title-order">Order Again</span>
              <br />
              <span className="title-accent">Your Favorites</span>
            </h2>

            <p className="previously-ordered-subtitle">
              Rediscover the dishes you loved! Quick reorder from your personal dining history.
            </p>
          </div>

          {/* Products Grid */}
          <Row className="g-4 previously-ordered-grid">
            {previousOrders.map((product) => (
              <Col lg={3} md={6} key={product.product_id}>
                <div className="previously-ordered-product-wrapper">
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
  );
};

export default PreviouslyOrderedSection;
