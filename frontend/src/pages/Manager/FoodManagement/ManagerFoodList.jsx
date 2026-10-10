"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../ManagerSidebar/ManagerSidebar.jsx"
import { getProducts } from "../../../api/product"
import "./ManagerFoodList.css"

const ManagerFoodList = () => {
  const navigate = useNavigate()
  const [foodList, setFoodList] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    setLoading(true)
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
      return;
    }
    const { role } = JSON.parse(user);
    if (role !== "manager") {
      navigate("/");
      return;
    }
    getProducts()
      .then((data) => setFoodList(data))
      .catch(() => setFoodList([]))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleEditClick = (product_id) => {
    navigate(`/manager-edit-food/${product_id}`)
  }

  const handleDetailClick = (product_id) => {
    navigate(`/manager-food-detail/${product_id}`)
  }

  const handleAddClick = () => {
    navigate("/manager-add-food")
  }

  // Get unique categories from food list (filter out null/undefined)
  const categories = [...new Set(foodList.map(food => food.category).filter(Boolean))].filter(cat => cat && cat.trim())

  // Filter food list based on search and filters
  const filteredFoodList = foodList.filter((food) => {
    // Safe string operations with null checks
    const foodName = food.name || ""
    const foodCategory = food.category || ""
    const foodStatus = food.status || "Active"
    
    const matchesSearch = foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         foodCategory.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "All" || foodCategory === categoryFilter
    const matchesStatus = statusFilter === "All" || 
                         (statusFilter === "Active" && (foodStatus === "Active" || foodStatus === "")) ||
                         (statusFilter === "Inactive" && foodStatus === "Inactive")
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <div className="food-management-header">
          <div className="header-content">
            <h3>Food Management</h3>
            <p>Manage and monitor restaurant dishes</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{foodList.length}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{foodList.filter((food) => food.status === "Active").length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{foodList.filter((food) => food.status === "Inactive").length}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        </div>

        <div className="food-header">
          <div className="search-filters-section">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search food by name or category..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filters-container">
              <div className="filter-group">
                <label>Category:</label>
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          <button className="add-food-btn" onClick={handleAddClick}>
            <span className="add-icon">+</span>
            Add Food
          </button>
        </div>

        {loading ? (
          <div className="text-center my-5">Loading...</div>
        ) : (
          <>
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                marginBottom: 24,
              }}
            >
              <table className="food-table" style={{ width: "100%", tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
              </table>
              <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                <table className="food-table" style={{ width: "100%", tableLayout: "fixed" }}>
                  <tbody>
                    {filteredFoodList.map((food) => (
                      <tr key={food.product_id}>
                        <td>
                          <div className="food-info">
                            {food.image_url && (
                              <img src={food.image_url || "/placeholder.svg"} alt={food.name || "Food item"} className="food-thumbnail" />
                            )}
                            <span className="food-name">{food.name || "Unnamed Item"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag">{food.category || "No Category"}</span>
                        </td>
                        <td className="price-cell">{(food.price || 0).toLocaleString()}đ</td>
                        <td className="stock-cell">
                          <span className={`stock-badge ${(food.stock_quantity || 0) < 10 ? "low-stock" : ""}`}>
                            {food.stock_quantity || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${(food.status === "Active" || !food.status) ? "active" : "inactive"}`}>
                            {food.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="detail-btn" onClick={() => handleDetailClick(food.product_id)} title="View Details">
                              Detail
                            </button>
                            <button className="edit-btn" onClick={() => handleEditClick(food.product_id)} title="Edit">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results info */}
            <div className="results-info">
              <span>Showing {filteredFoodList.length} of {foodList.length} items</span>
              {(searchTerm || categoryFilter !== "All" || statusFilter !== "All") && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("All")
                    setStatusFilter("All")
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredFoodList.length === 0 && !loading && foodList.length > 0 && (
              <div className="empty-state">
                <div className="empty-content">
                  <div className="empty-icon">🔍</div>
                  <h4>No items found</h4>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}

            {foodList.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-content">
                  <div className="empty-icon">🍽️</div>
                  <h4>No food items yet</h4>
                  <p>Start by adding your first food item to the menu</p>
                  <button className="add-first-btn" onClick={handleAddClick}>
                    Add First Food Item
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ManagerFoodList
