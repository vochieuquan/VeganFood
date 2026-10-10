"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../ManagerSidebar/ManagerSidebar.jsx"
import { createProduct } from "../../../api/product" // Thêm dòng này
import "./AddFoodPage.css"

const ManagerAddFoodPage = ({ onSave }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    stock_quantity: "",
    image_url: ""
  })
  const [imagePreview, setImagePreview] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false) // Thêm loading state

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB")
        return
      }

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Food name is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Valid price is required"
    }

    if (!formData.stock_quantity || formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Valid stock quantity is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const CLOUDINARY = 'dtzndkuo9';
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "veganfood"); 
    formData.append("cloud_name", CLOUDINARY);


    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY}/image/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      return data.secure_url
    } catch (error) {
      console.error("Cloudinary upload error:", error)
      return null
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let imageUrl = formData.image_url

      // Nếu user đã chọn file, upload file lên Cloudinary
      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile)
        if (!uploadedUrl) {
          alert("Image upload failed. Please try again.")
          setLoading(false)
          return
        }
        imageUrl = uploadedUrl
      }

      const foodData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseInt(formData.price),
        stock_quantity: Number.parseInt(formData.stock_quantity),
        image_url: imageUrl,
        category: formData.category,
        total_order: 0,
      }

      await createProduct(foodData)
      alert("Food item added successfully!")
      navigate("/manager-food")
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to add food item. Please try again!")
    } finally {
      setLoading(false)
    }
  }


  const handleCancel = () => {
    if (Object.values(formData).some((value) => value !== "" && value !== "Active")) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/manager-food")
      }
    } else {
      navigate("/manager-food")
    }
  }

  const handleBackToList = () => {
    handleCancel()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      description: "",
      stock_quantity: "",
      image_url: "",
    })
    setImagePreview("")
    setImageFile(null)
    setErrors({})
  }

  return (
    <div className="add-food-page">
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="add-food-header">
            <button className="back-btn" onClick={handleBackToList}>
              <span className="back-icon">←</span>
              Back to Food List
            </button>
            <h3>Add New Food Item</h3>
            <button type="button" className="reset-btn" onClick={resetForm}>
              <span className="reset-icon">↻</span>
              Reset Form
            </button>
          </div>

          <div className="add-food-container">
            <form onSubmit={handleSubmit} className="add-food-form">
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
                      className={`form-input ${errors.name ? "error" : ""}`}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`form-select ${errors.category ? "error" : ""}`}
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
                    {errors.category && <span className="error-message">{errors.category}</span>}
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
                      className={`form-input ${errors.price ? "error" : ""}`}
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
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
                      className={`form-input ${errors.stock_quantity ? "error" : ""}`}
                    />
                    {errors.stock_quantity && <span className="error-message">{errors.stock_quantity}</span>}
                  </div>

                  <div className="form-group">

                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Image Upload</h4>
                <div className="image-upload-section">
                  <div className="upload-instructions">
                    <p>Add an attractive image of your food item to make it more appealing to customers!</p>
                    <p>
                      <small>Supported formats: JPG, PNG, GIF | Max size: 5MB</small>
                    </p>
                  </div>

                  <div className="image-upload-options">
                    <div className="upload-method">
                      <label className="upload-btn">
                        <span className="upload-icon">📁</span>
                        Choose Image File
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                      </label>
                      <span className="upload-text">or</span>
                      <div className="form-group url-input">
                        <input
                          type="url"
                          placeholder="Paste image URL here"
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
                      <p className="preview-text">✅ Image looks great!</p>
                    </div>
                  )}

                  {!imagePreview && (
                    <div className="no-image-placeholder">
                      <div className="placeholder-content">
                        <span className="placeholder-icon">🖼️</span>
                        <p>No image selected</p>
                        <small>Upload an image to see preview</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Description</h4>
                <div className="form-group">
                  <label htmlFor="description">Food Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your food item in detail... Include ingredients, taste, cooking method, or any special features that make it unique!"
                    rows="5"
                    className="form-textarea"
                  />
                  <small className="helper-text">
                    💡 A good description helps customers understand what makes your dish special
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="reset-btn-secondary" onClick={resetForm}>
                  Reset
                </button>
                <button type="submit" className="add-btn" disabled={loading}>
                  <span className="add-icon">+</span>
                  {loading ? "Adding..." : "Add Food Item"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ManagerAddFoodPage
