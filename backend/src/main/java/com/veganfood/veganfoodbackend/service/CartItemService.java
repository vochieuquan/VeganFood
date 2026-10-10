package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.CartItemDTO;
import com.veganfood.veganfoodbackend.model.*;
import com.veganfood.veganfoodbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartItemsByUserId(Integer userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        return cartItemRepository.findByCart_CartId(cart.getCartId());
    }

    // 🔥 Thêm method trả về DTO
    public List<CartItemDTO> getCartItemsDTOByUserId(Integer userId) {
        List<CartItem> cartItems = getCartItemsByUserId(userId);
        return cartItems.stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItem addProductToCart(Integer userId, Integer productId, int quantity) {
        if (quantity < 1 || quantity > 99) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be between 1 and 99");
        }
        Cart cart = cartRepository.findByUserUserIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(new CartItem(cart, product, 0));
        if (cartItem.getQuantity() + quantity > 99) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart quantity cannot exceed 99");
        }
        if (product.getStock_quantity() == null || cartItem.getQuantity() + quantity > product.getStock_quantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Requested quantity exceeds available stock");
        }
        cartItem.setQuantity(cartItem.getQuantity() + quantity);

        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeProductFromCart(Integer userId, Integer productId) {
        Cart cart = cartRepository.findByUserUserIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Integer userId) {
        Cart cart = cartRepository.findByUserUserIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cartItemRepository.deleteByCart(cart);
    }

    @Transactional
    public CartItem updateProductQuantity(Integer userId, Integer productId, int quantity) {
        Cart cart = cartRepository.findByUserUserIdForUpdate(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        if (quantity > 99) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot exceed 99");
        }
        if (product.getStock_quantity() == null || quantity > product.getStock_quantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

}
