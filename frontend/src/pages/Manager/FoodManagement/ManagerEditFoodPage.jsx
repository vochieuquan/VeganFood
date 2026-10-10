"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../ManagerSidebar/ManagerSidebar.jsx"
import "./EditFoodPage.css"
import { updateProduct, getProductById } from '../../../api/product';

const EditFoodPage = ({ foodIndex, foodData, onSave }) => {
  const { id } = useParams();

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    stock_quantity: "",
    image_url: "",
    total_order: 0,
    product_id: ""
  })
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (id) {
      getProductById(id).then(data => {
        setFormData(data);
        setImagePreview(data.image_url || "");
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result
        setImagePreview(imageUrl)
        setFormData({ ...formData, image_url: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setFormData({ ...formData, image_url: url })
    setImagePreview(url)
  }

  const removeImage = () => {
    setImagePreview("")
    setImageFile(null)
    setFormData({ ...formData, image_url: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    if (formData.product_id) {
      // Chuẩn bị data đúng format
      const data = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        image_url: formData.image_url,
        category: formData.category,
        total_order: formData.total_order || 0
      };
      try {
        await updateProduct(formData.product_id, data);
        alert('Update food successfully!');
      } catch (err) {
        alert('Update food failed!');
      }
    }
    navigate("/manager-food");
  }

  const handleCancel = () => {
    navigate("/manager-food")
  }

  const handleBackToList = () => {
    navigate("/manager-food")
  }

  return (
    <div className="edit-food-page">
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="edit-food-header">
            <button className="back-btn" onClick={handleBackToList}>
              <span className="back-icon">←</span>
              Back to Food List
            </button>
            <h3>{foodIndex !== null ? "Edit Food Item" : "Add New Food Item"}</h3>
          </div>

          <div className="edit-food-container">
            <form onSubmit={handleSubmit} className="edit-food-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Food Name *</label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter food name"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select category</option>
                      <option value="Rice & Grains">Rice & Grains</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Mushrooms">Mushrooms</option>
                      <option value="Beans & Tofu">Beans & Tofu</option>
                      <option value="Nuts & Roots">Nuts & Roots</option>
                      <option value="Noodles">Noodles</option>
                      <option value="Vegan Meat Alternatives">Vegan Meat Alternatives</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Price (VND) *</label>
                    <input
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      type="number"
                      min="0"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock_quantity">Stock Quantity *</label>
                    <input
                      id="stock_quantity"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      placeholder="Enter stock quantity"
                      type="number"
                      min="0"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Image Upload</h4>
                <div className="image-upload-section">
                  <div className="image-upload-options">
                    <div className="upload-method">
                      <label className="upload-btn">
                        <span className="upload-icon">📁</span>
                        Upload Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                      </label>
                      <span className="upload-text">or</span>
                      <div className="form-group url-input">
                        <input
                          type="url"
                          placeholder="Enter image URL"
                          value={formData.image_url}
                          onChange={handleImageUrlChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="image-preview">
                      <div className="preview-container">
                        <img src={imagePreview || "/placeholder.svg"} alt="Food preview" className="preview-image" />
                        <button type="button" className="remove-image-btn" onClick={removeImage}>
                          <span className="close-icon">×</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Description</h4>
                <div className="form-group">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description of the food item..."
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {foodIndex !== null ? "Update Food" : "Add Food"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditFoodPage
