package com.veganfood.veganfoodbackend.dto;

import com.veganfood.veganfoodbackend.model.CartItem;
import com.veganfood.veganfoodbackend.model.Product;

public class CartItemDTO {
    private Integer cartItemId;
    private Integer cartId;
    private Integer productId;
    private String productName;
    private String imageUrl;
    private Double productPrice;
    private Integer quantity;
    private Double totalPrice;

    public CartItemDTO() {
    }

    public CartItemDTO(CartItem cartItem) {
        this.cartItemId = cartItem.getCartItemId();
        this.cartId = cartItem.getCart().getCartId();

        Product product = cartItem.getProduct();
        if (product != null) {
            this.productId = product.getProduct_id();
            this.productName = product.getName();
            this.productPrice = product.getPrice();
            this.imageUrl = product.getImage_url();
            this.totalPrice = product.getPrice() * cartItem.getQuantity();
        }

        this.quantity = cartItem.getQuantity();
    }

    public Integer getCartItemId() {
        return cartItemId;
    }

    public void setCartItemId(Integer cartItemId) {
        this.cartItemId = cartItemId;
    }

    public Integer getCartId() {
        return cartId;
    }

    public void setCartId(Integer cartId) {
        this.cartId = cartId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(Double productPrice) {
        this.productPrice = productPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
}
