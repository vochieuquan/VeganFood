package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.CartItemDTO;
import com.veganfood.veganfoodbackend.dto.CartResponseDTO;
import com.veganfood.veganfoodbackend.model.Cart;
import com.veganfood.veganfoodbackend.model.CartItem;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.repository.CartItemRepository;
import com.veganfood.veganfoodbackend.repository.CartRepository;
import com.veganfood.veganfoodbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    public Cart getOrCreateCartByUserId(Integer userId) {
        return cartRepository.findByUserUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    public void deleteCartByUserId(Integer userId) {
        cartRepository.findByUserUserId(userId)
                .ifPresentOrElse(
                        cartRepository::delete,
                        () -> {
                            throw new RuntimeException("Cart not found for userId: " + userId);
                        }
                );
    }

    public CartResponseDTO getCartWithItems(Integer userId) {
        Cart cart = getOrCreateCartByUserId(userId);

        // 👉 DEBUG ở đây để kiểm tra có dữ liệu không
        System.out.println("DEBUG: Getting cart items for cartId = " + cart.getCartId());

        List<CartItem> items = cartItemRepository.findByCart_CartId(cart.getCartId());
        System.out.println("DEBUG: CartItem count = " + items.size());

        List<CartItemDTO> itemDTOs = items.stream()
                .map(CartItemDTO::new)
                .collect(Collectors.toList());

        double total = itemDTOs.stream()
                .mapToDouble(CartItemDTO::getTotalPrice)
                .sum();

        return new CartResponseDTO(cart.getCartId(), userId, itemDTOs, total);
    }
}
