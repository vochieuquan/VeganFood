package com.veganfood.veganfoodbackend.dto;

import com.veganfood.veganfoodbackend.model.Cart;
import com.veganfood.veganfoodbackend.model.CartItem;
import com.veganfood.veganfoodbackend.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class CartDTO {
    private Integer cartId;
    private Integer userId;
    private List<CartItemDTO> items;
    private Double totalAmount;

    public CartDTO() {
    }

    public CartDTO(Cart cart) {
        this.cartId = cart.getCartId();
        User user = cart.getUser();
        this.userId = user != null ? user.getUserId() : null;

        // Map CartItem to CartItemDTO
        if (cart.getItems() != null) {
            this.items = cart.getItems().stream()
                    .map(CartItemDTO::new)
                    .collect(Collectors.toList());

            // Tính tổng tiền
            this.totalAmount = items.stream()
                    .mapToDouble(CartItemDTO::getTotalPrice)
                    .sum();
        } else {
            this.totalAmount = 0.0;
        }
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
