package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.dto.CartResponseDTO;
import com.veganfood.veganfoodbackend.model.Cart;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.service.CartService;
import com.veganfood.veganfoodbackend.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthUtil authUtil;

    @PostMapping
    public Cart createOrGetCart() {
        User currentUser = authUtil.getCurrentUser();
        return cartService.getOrCreateCartByUserId(currentUser.getUserId());
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCartWithItems() {
        User currentUser = authUtil.getCurrentUser();
        CartResponseDTO response = cartService.getCartWithItems(currentUser.getUserId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteCart() {
        User currentUser = authUtil.getCurrentUser();
        cartService.deleteCartByUserId(currentUser.getUserId());
        return ResponseEntity.ok("Cart deleted successfully");
    }
}