package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.Cart;
import com.veganfood.veganfoodbackend.model.CartItem;
import com.veganfood.veganfoodbackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    // ✅ Sử dụng method name query chuẩn của Spring Data JPA
    List<CartItem> findByCart_CartId(Integer cartId);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    void deleteByCart(Cart cart);
}
