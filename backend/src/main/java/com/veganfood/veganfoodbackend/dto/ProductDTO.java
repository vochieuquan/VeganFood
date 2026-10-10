package com.veganfood.veganfoodbackend.dto;

import com.veganfood.veganfoodbackend.model.Product;

public class ProductDTO {
    private Integer product_id;
    private String name;
    private String description;
    private Double price;
    private Integer stock_quantity;
    private String image_url;
    private String category;
    private Integer total_order;

    public ProductDTO() {
        // Default constructor cho Jackson
    }

    public ProductDTO(Product product) {
        this.product_id = product.getProduct_id();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.stock_quantity = product.getStock_quantity();
        this.image_url = product.getImage_url();
        this.category = product.getCategory();
        this.total_order = product.getTotal_order();
    }

    // GETTERS
    public Integer getProduct_id() { return product_id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public Integer getStock_quantity() { return stock_quantity; }
    public String getImage_url() { return image_url; }
    public String getCategory() { return category; }
    public Integer getTotal_order() { return total_order; }

    // SETTERS
    public void setProduct_id(Integer product_id) { this.product_id = product_id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(Double price) { this.price = price; }
    public void setStock_quantity(Integer stock_quantity) { this.stock_quantity = stock_quantity; }
    public void setImage_url(String image_url) { this.image_url = image_url; }
    public void setCategory(String category) { this.category = category; }
    public void setTotal_order(Integer total_order) { this.total_order = total_order; }
}
