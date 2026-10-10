"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { appTheme } from "../../../constant/color_constants"
import StaffSidebar from "../StaffSidebar/StaffSidebar"
import { getProducts } from "../../../api/product"

const StaffFoodList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const data = await getProducts()
        setFoods(data)
      } catch (err) {
        setFoods([])
      }
      setLoading(false)
    }
    fetchFoods()
  }, [])

  const getStatusBadge = (stock_quantity) => {
    if (stock_quantity > 0) return <Badge bg="success">Available</Badge>
    return <Badge bg="danger">Out of Stock</Badge>
  }

  const handleViewDetail = (foodId) => {
    navigate(`/staff-food-detail/${foodId}`)
  }

  // Get unique categories from foods list
  const categories = [...new Set(foods.map(food => food.category).filter(Boolean))].filter(cat => cat && cat.trim())

  const filteredFoods = foods.filter(
    (food) => {
      const foodName = food.name || ""
      const foodCategory = food.category || ""
      const searchText = searchTerm.toLowerCase()
      
      const matchesSearch = foodName.toLowerCase().includes(searchText) ||
                           foodCategory.toLowerCase().includes(searchText)
      
      const matchesCategory = categoryFilter === "All" || foodCategory === categoryFilter
      
      return matchesSearch && matchesCategory
    }
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="success" />
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="main-content" style={{ backgroundColor: appTheme.background }}>
        <Container fluid className="p-4">
          <Row className="mb-4">
            <Col>
              <h2 style={{ color: appTheme.primary }}>Food List</h2>
              <p className="text-muted">View available food items and their status.</p>
            </Col>
          </Row>

          {/* Search Bar and Filters */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">🔍</Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ 
                  borderColor: appTheme.primary,
                  fontSize: '14px'
                }}
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              {(searchTerm || categoryFilter !== "All") && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("All")
                  }}
                  className="w-100"
                >
                  Clear Filters
                </Button>
              )}
            </Col>
          </Row>

          {/* Results Info */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span className="text-muted">
                  Showing {filteredFoods.length} of {foods.length} items
                  {categoryFilter !== "All" && <span className="text-primary"> in "{categoryFilter}"</span>}
                </span>
                {filteredFoods.length === 0 && foods.length > 0 && (
                  <span className="text-warning">No items match your filters</span>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header style={{ backgroundColor: appTheme.primary, color: "white" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Available Food Items</h5>
                    <Badge bg="light" text="dark">
                      {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {filteredFoods.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        {foods.length === 0 ? '🍽️' : '🔍'}
                      </div>
                      <h5 className="text-muted">
                        {foods.length === 0 ? 'No food items available' : 'No items found'}
                      </h5>
                      <p className="text-muted">
                        {foods.length === 0 
                          ? 'There are no food items in the system yet.' 
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                      {(searchTerm || categoryFilter !== "All") && (
                        <Button 
                          variant="primary" 
                          onClick={() => {
                            setSearchTerm("")
                            setCategoryFilter("All")
                          }}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFoods.map((food) => (
                          <tr key={food.product_id}>
                            <td>
                              <img
                                src={food.image_url || "/placeholder.svg"}
                                alt={food.name || "Food item"}
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                              />
                            </td>
                            <td>
                              <strong>{food.name || "Unnamed Item"}</strong>
                            </td>
                            <td>
                              <Badge bg="secondary" className="me-1">
                                {food.category || "No Category"}
                              </Badge>
                            </td>
                            <td>
                              <strong style={{ color: appTheme.primary }}>
                                {(food.price || 0).toLocaleString()}đ
                              </strong>
                            </td>
                            <td>{getStatusBadge(food.stock_quantity || 0)}</td>
                            <td>
                              <span style={{ maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {food.description || "No description"}
                              </span>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm" onClick={() => handleViewDetail(food.product_id)}>
                                View Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default StaffFoodList
