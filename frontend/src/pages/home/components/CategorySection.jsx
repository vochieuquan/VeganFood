"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../../api/config";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import ProductCard from "../../../components/ProductCard";
import "./CategorySection.css";

const CATEGORY_LIST = [
  "Rice & Grains",
  "Vegetables",
  "Mushrooms",
  "Beans & Tofu",
  "Nuts & Roots",
  "Noodles",
  "Vegan Meat Alternatives",
  "Desserts",
];

const idMap = {
  "Rice & Grains": "rice-grains",
  "Vegetables": "vegetables",
  "Mushrooms": "mushrooms",
  "Beans & Tofu": "beans-tofu",
  "Nuts & Roots": "nuts-roots",
  "Noodles": "noodles",
  "Vegan Meat Alternatives": "vegan-meat-alternatives",
  "Desserts": "desserts",
};

const CategorySection = () => {
  const [products, setProducts] = useState([]); // ← dữ liệu từ API
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // Gọi API khi component load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleExpand = (category) => {
    if (expanded[category]) {
      // Nếu đang expanded, sau khi collapse sẽ scroll về đầu section
      setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
      setTimeout(() => {
        const sectionId = idMap[category] || category;
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0); // Đợi render xong mới scroll
    } else {
      setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div className="category-section">
      <Container>
        {CATEGORY_LIST.map((category) => {
          const allProducts = products.filter((p) => p.category === category);
          const isExpanded = expanded[category];
          const displayedProducts = isExpanded ? allProducts : allProducts.slice(0, 4);
          const showViewMore = allProducts.length > 4;
          const sectionId = idMap[category] || category;

          return (
            <div key={category} className="category-content mb-5" id={sectionId}>
              <div className="category-header mb-3">
                <div className="category-title">
                  <h2>{category}</h2>
                </div>
              </div>
              <Row>
                {displayedProducts.map((product) => (
                  <Col lg={3} md={6} className="mb-4" key={product.product_id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              {showViewMore && (
                <div className="view-more-section text-center mt-2">
                  <Button
                    variant="outline-success"
                    className="view-more-btn"
                    onClick={() => toggleExpand(category)}
                  >
                    {isExpanded ? "Collapse" : "View More"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Container>
    </div>
  );
};

export default CategorySection;
