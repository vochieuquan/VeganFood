package com.veganfood.veganfoodbackend.dto;

import java.math.BigDecimal;

public class OrderItemDTO {
    private String productName;
    private int quantity;
    private BigDecimal priceAtTime;

    // Getters & Setters

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtTime() {
        return priceAtTime;
    }

    public void setPriceAtTime(BigDecimal priceAtTime) {
        this.priceAtTime = priceAtTime;
    }
}
