package com.veganfood.veganfoodbackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer product_id;

    @Column(length = 100)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private Integer stock_quantity;
    private String image_url;
    @Column(length = 100)
    private String category;
    private Integer total_order;

    // Getters and Setters
    public Integer getProduct_id() { return product_id; }
    public void setProduct_id(Integer product_id) { this.product_id = product_id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock_quantity() { return stock_quantity; }
    public void setStock_quantity(Integer stock_quantity) { this.stock_quantity = stock_quantity; }

    public String getImage_url() { return image_url; }
    public void setImage_url(String image_url) { this.image_url = image_url; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotal_order() { return total_order; }
    public void setTotal_order(Integer total_order) { this.total_order = total_order; }
}
