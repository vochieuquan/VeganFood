package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.dto.CartItemDTO;
import com.veganfood.veganfoodbackend.model.CartItem;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.service.CartItemService;
import com.veganfood.veganfoodbackend.service.CartService;
import com.veganfood.veganfoodbackend.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart/items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthUtil authUtil;

    @PostMapping("/add")
    public CartItem addItemToCart(
            @RequestParam Integer productId,
            @RequestParam Integer quantity
    ) {
        User currentUser = authUtil.getCurrentUser();
        Integer userId = currentUser.getUserId();

        cartService.getOrCreateCartByUserId(userId); // đảm bảo cart tồn tại
        return cartItemService.addProductToCart(userId, productId, quantity);
    }

    // ✅ Đã chỉnh: trả về DTO
    @GetMapping
    public List<CartItemDTO> getCartItems() {
        User currentUser = authUtil.getCurrentUser();
        return cartItemService.getCartItemsDTOByUserId(currentUser.getUserId());
    }

    @DeleteMapping("/remove")
    public void removeItemFromCart(@RequestParam Integer productId) {
        User currentUser = authUtil.getCurrentUser();
        cartItemService.removeProductFromCart(currentUser.getUserId(), productId);
    }

    @DeleteMapping("/clear")
    public void clearCart() {
        User currentUser = authUtil.getCurrentUser();
        cartItemService.clearCart(currentUser.getUserId());
    }

    @PutMapping("/update")
    public CartItemDTO updateItemQuantity(
            @RequestParam Integer productId,
            @RequestParam Integer quantity
    ) {
        User currentUser = authUtil.getCurrentUser();
        CartItem updatedItem = cartItemService.updateProductQuantity(currentUser.getUserId(), productId, quantity);
        return updatedItem != null ? new CartItemDTO(updatedItem) : null;
    }
}
