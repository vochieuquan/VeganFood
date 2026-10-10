package com.veganfood.veganfoodbackend.dto;

import java.util.List;

public class CartResponseDTO {
    private Integer cartId;
    private Integer userId;
    private List<CartItemDTO> items;
    private Double totalAmount;

    public CartResponseDTO() {
    }

    public CartResponseDTO(Integer cartId, Integer userId, List<CartItemDTO> items, Double totalAmount) {
        this.cartId = cartId;
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
