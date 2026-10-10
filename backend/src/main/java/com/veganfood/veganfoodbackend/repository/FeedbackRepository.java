package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.Feedback;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    // ✅ Sử dụng native query để tránh mapping issues
    @Query(value = "SELECT * FROM feedback WHERE product_id = :productId", nativeQuery = true)
    List<Feedback> findByProductId(@Param("productId") Integer productId);

    // ✅ Hoặc dùng method naming convention (Spring tự generate query)
    // List<Feedback> findByProductProductId(Integer productId);
}
