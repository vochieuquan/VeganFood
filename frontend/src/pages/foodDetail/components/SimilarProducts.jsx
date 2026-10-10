"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { Container, Button, Row, Col } from "react-bootstrap";
import ProductCard from "../../../components/ProductCard";
import { getProductById, getProductsByCategory } from "../../../api/product";

const SimilarProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { productId } = useParams();
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        if (!productId) return;

        // Get current product info using the API service
        const currentProduct = await getProductById(productId);

        if (!currentProduct || !currentProduct.category) {
          console.warn("Không tìm thấy sản phẩm hiện tại hoặc thiếu category");
          return;
        }

        // Get all products in the same category using the API service
        const allProducts = await getProductsByCategory(currentProduct.category) || [];

        // Filter out similar products but exclude the current one
        const similar = allProducts.filter((p) => p.product_id !== Number(productId));

        setProducts(similar.slice(0, 12)); // limit to 12 products
      } catch (error) {
        console.error("Error loading similar products:", error);
        setProducts([]);
      }
    };

    fetchSimilarProducts();
  }, [productId]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, products.length - itemsPerPage);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + itemsPerPage));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, products.length - itemsPerPage);
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - itemsPerPage));
  };
  
  // Calculate current page for pagination dots
  const currentPage = Math.floor(currentIndex / itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section className="similar-products-section py-5 bg-light">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">Similar Products</h2>
          <p className="fs-5 text-muted mb-0">Discover more delicious items in the same category</p>
        </div>

        <div className="position-relative">
          {/* Navigation Buttons */}
          {products.length > itemsPerPage && (
            <>
              <Button
                variant="white"
                size="lg"
                className="position-absolute top-50 translate-middle-y start-0 rounded-circle shadow border-0"
                style={{ zIndex: 10, marginLeft: "-30px", width: "60px", height: "60px" }}
                onClick={prevSlide}
              >
                <ChevronLeft size={24} className="text-success" />
              </Button>

              <Button
                variant="white"
                size="lg"
                className="position-absolute top-50 translate-middle-y end-0 rounded-circle shadow border-0"
                style={{ zIndex: 10, marginRight: "-30px", width: "60px", height: "60px" }}
                onClick={nextSlide}
              >
                <ChevronRight size={24} className="text-success" />
              </Button>
            </>
          )}

          {/* Product Grid */}
          <Row className="g-4">
            {visibleProducts.map((product) => (
              <Col key={product.product_id} lg={3} md={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Pagination Dots */}
          {products.length > itemsPerPage && (
            <div className="d-flex justify-content-center align-items-center mt-5">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * itemsPerPage)}
                  className={`btn p-0 mx-1 rounded-circle ${index === currentPage ? 'bg-success' : 'bg-outline-success border border-success'}`}
                  style={{
                    width: '12px',
                    height: '12px',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default SimilarProducts;
