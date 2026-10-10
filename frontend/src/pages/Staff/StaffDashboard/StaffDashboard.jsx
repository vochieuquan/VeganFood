import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Table, Spinner, Alert } from "react-bootstrap";
import { appTheme } from "../../../constant/color_constants";
import StaffSidebar from "../StaffSidebar/StaffSidebar";
import { useNavigate } from "react-router-dom";
import { getOrder } from "../../../api/order";
import { getProducts } from "../../../api/product";
import PieChartGeneral from "./PieChartGeneral";
import LineChartOrderByDate from "./LineChartOrderByDate";
import TimeGranularityOrderChart from "./TimeGranularityOrderChart";
import RevenueBarChart from "./RevenueBarChart";
import OrderStatusPieChart from "./OrderStatusPieChart";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    assignedOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    customerSupport: 0
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (!token || !userJson) {
      navigate("/login");
      return;
    }

    const { role } = JSON.parse(userJson);
    if (role !== "staff") {
      navigate("/");
      return;
    }

    const fetchStaffOrders = async () => {
      try {
        const orders = await getOrder(); // getOrder đã dùng fetch, trả về promise
        if (Array.isArray(orders)) {
          setRecentOrders(orders);
          const pending = orders.filter(o => o.status === "Pending").length;
          const completed = orders.filter(o =>
            o.status === "Delivered" || o.status === "Completed"
          ).length;
          setDashboardData({
            assignedOrders: orders.length,
            pendingOrders: pending,
            completedToday: completed,
            customerSupport: 0
          });
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        setError("Failed to load orders. Please check your token or network.");
      } finally {
        setLoading(false);
      }
    };
    fetchStaffOrders();

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await getProducts();
        setProducts(Array.isArray(res) ? res : []);
      } catch (err) {
        setErrorProducts("Failed to load menu items");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [navigate]);

  const getStatusBadge = status => {
    const color = {
      Preparing: "warning",
      Ready: "success",
      Delivering: "info",
      Pending: "secondary",
      Completed: "primary",
      Delivered: "success"
    }[status] || "dark";
    return <Badge bg={color}>{status}</Badge>;
  };

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: appTheme.primary }}>Staff Dashboard</h2>
              <p className="text-muted">Monitor your assigned tasks and orders.</p>
            </Col>
          </Row>

          {/* Pie Chart: Quantity of dishes by category */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  {loadingProducts ? (
                    <Spinner animation="border" />
                  ) : errorProducts ? (
                    <Alert variant="danger">{errorProducts}</Alert>
                  ) : (
                    <PieChartGeneral
                      title="Quantity of dishes by category"
                      data={Object.entries(
                        products
                          .filter(p => p && p.category) // Filter out products without category
                          .reduce((acc, p) => {
                            acc[p.category] = (acc[p.category] || 0) + 1;
                            return acc;
                          }, {})
                      ).map(([name, value]) => ({ 
                        name: name || 'Uncategorized', 
                        value 
                      }))}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Pie Chart: Order Status Ratio */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <OrderStatusPieChart 
                    recentOrders={recentOrders}
                    loading={loading}
                    error={error}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Line Chart: Number of Orders Over Time (with filter) */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="h-100">
                <Card.Body>
                  <TimeGranularityOrderChart
                    recentOrders={recentOrders}
                    loading={loading}
                    error={error}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Bar Chart: Revenue by Day/Month/Year */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="h-100">
                <Card.Body>
                  <RevenueBarChart
                    recentOrders={recentOrders}
                    loading={loading}
                    error={error}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default StaffDashboard;
