"use client";

import { useState, useEffect } from "react";
import { Dash, Plus, Cart, Truck } from "react-bootstrap-icons";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  ButtonGroup,
  Card,
  ListGroup,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import placeholderImage from "../../../assets/image/placeholder.svg";
import { getProductById } from "../../../api/product";
import { addToCart } from "../../../api/cart";
import "./ProductDetails.css";
import { useCart } from "../../../context/CartContext";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const { showNotification } = useCart();
  const { productId } = useParams();
  const [inputValue, setInputValue] = useState('1');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setProduct(null);
        return;
      }

      try {
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string (for backspace)
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      if (numValue <= 0) {
        setInputValue('1');
        setQuantity(1);
      } else if (product && numValue > product.stock_quantity) {
        setInputValue(product.stock_quantity.toString());
        setQuantity(product.stock_quantity);
      } else {
        setInputValue(value);
        setQuantity(numValue);
      }
    }
  };

  const handleQuantityBlur = () => {
    // If input is empty, set to 1
    if (inputValue === '') {
      setInputValue('1');
      setQuantity(1);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("❌ You must be logged in to add products to the cart.");
      return;
    }

    try {
      // Using the cart API service instead of direct axios call
      await addToCart(product.product_id, quantity);
      showNotification(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("❌ Failed to add product to cart.");
    }
  };

  if (!productId) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "500px" }}>
        <h3 className="text-muted">Please select a product to view details</h3>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "500px" }}>
        <div className="text-center">
          <h3 className="text-muted">Product not found</h3>
          <p className="text-muted">Please try again with another product</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <section className="product-hero bg-light py-5 mt-4">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={6}>
              <div className="main-image-container bg-gradient-success p-4 rounded-4 shadow-lg">
                <Image
                  src={product.image_url || placeholderImage}
                  alt={product.name}
                  className="img-fluid rounded-3 shadow"
                  style={{ maxHeight: "700px", width: "100%", objectFit: "contain" }}
                />
              </div>
            </Col>

            <Col lg={6}>
              <div className="product-info">
                <div className="mb-4">
                  <span
                    className="mb-3 text-uppercase"
                    style={{
                      background: "#347928",
                      color: "#FFFFFF",
                      borderRadius: 20,
                      fontWeight: 700,
                      padding: "0.5rem 1.5rem",
                      fontSize: "1rem",
                      letterSpacing: 1,
                      display: "inline-block",
                    }}
                  >
                    {product.category}
                  </span>
                  <h1 className="mb-3 lh-sm" style={{ fontWeight: 700, fontSize: "2.5rem" }}>
                    {product.name}
                  </h1>
                </div>

                <div className="mb-4">
                  <div className="d-flex flex-column">
                    <label className="form-label fw-bold mb-2">Price:</label>
                    <span className="fw-bold" style={{ fontSize: "2rem", color: '#212529' }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(product.price || 0)}
                    </span>
                  </div>
                </div>

                <Row className="g-3 mb-4">
                  <Col md={12}>
                    <div className="d-flex align-items-end gap-2">
                      <div className="flex-grow-1" style={{ maxWidth: 300 }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label fw-bold mb-0">Quantity:</label>
                          {product && (
                            <small className="text-muted">
                              In stock: {product.stock_quantity}
                            </small>
                          )}
                        </div>
                        <ButtonGroup size="lg" className="w-100" style={{ height: '46px' }}>
                          <Button 
                            variant="outline-success" 
                            onClick={decrementQuantity}
                            style={{
                              borderTopRightRadius: 0,
                              borderBottomRightRadius: 0,
                              width: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Dash size={20} />
                          </Button>
                          <div 
                            className="d-flex align-items-center justify-content-center" 
                            style={{
                              width: '100px',
                              backgroundColor: '#fff',
                              border: '1px solid #198754',
                              borderLeft: 'none',
                              borderRight: 'none',
                              height: '100%',
                              padding: '0.5rem',
                              fontSize: '1rem',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <input
                              type="text"
                              value={inputValue}
                              onChange={handleQuantityChange}
                              onBlur={handleQuantityBlur}
                              style={{
                                width: '100%',
                                border: 'none',
                                textAlign: 'center',
                                outline: 'none',
                                background: 'transparent',
                                padding: 0
                              }}
                              aria-label="Quantity"
                            />
                          </div>
                          <Button
                            variant="outline-success"
                            onClick={incrementQuantity}
                            disabled={product && quantity >= product.stock_quantity}
                            style={{
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              width: '46px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={20} />
                          </Button>
                        </ButtonGroup>
                      </div>
                      <Button
                        size="lg"
                        className="py-2 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 border-0 add-to-cart-btn"
                        style={{
                          minWidth: 180,
                          background: "#FCCD2A",
                          color: "#347928",
                          borderRadius: 12,
                          boxShadow: "0 2px 8px rgba(52,121,40,0.08)",
                          fontWeight: 700,
                        }}
                        onClick={handleAddToCart}
                      >
                        <Cart size={20} style={{ color: "#347928" }} className="me-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="product-details-section py-5 bg-white">
        <Container>
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm" style={{ borderLeft: "6px solid #347928", borderRadius: 16 }}>
                <Card.Header className="border-0 py-3" style={{ background: "#347928", color: "#fff" }}>
                  <h5 className="mb-0 fw-bold">Product Details</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0 py-3 bg-light rounded-3 mb-2">
                      <Row>
                        <Col sm={4} className="fw-semibold text-success">Category:</Col>
                        <Col sm={8}>{product.category}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0 py-3 bg-light rounded-3 mb-2">
                      <Row>
                        <Col sm={4} className="fw-semibold text-success">Status:</Col>
                        <Col sm={8}>In Stock</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0 py-3 bg-light rounded-3">
                      <Row>
                        <Col sm={4} className="fw-semibold text-success">Description:</Col>
                        <Col sm={8}>{product.description}</Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm" style={{ borderLeft: "6px solid #347928", borderRadius: 16 }}>
                <Card.Header className="border-0 py-3" style={{ background: 'linear-gradient(135deg, #347928, #4CAF50)' }}>
                  <h5 className="mb-0 fw-bold">Shipping Policy</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0 px-0 py-3 d-flex align-items-center bg-light rounded-3">
                      <Truck className="me-3 text-success" size={20} />
                      <div>
                        <div className="fw-semibold text-success">Free Shipping</div>
                        <small>For orders from 200,000 VND</small>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ProductDetails;
