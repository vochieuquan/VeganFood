package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByCategoryIgnoreCase(String category);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.product_id = :productId")
    java.util.Optional<Product> findByIdForUpdate(@Param("productId") Integer productId);
}
