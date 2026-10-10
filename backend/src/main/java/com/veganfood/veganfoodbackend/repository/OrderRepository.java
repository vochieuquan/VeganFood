package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.Order;
import com.veganfood.veganfoodbackend.model.OrderItem;
import com.veganfood.veganfoodbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser(User user); // Xem đơn hàng của 1 user
    @Query(value = "SELECT SUM(total_amount) FROM `Order` WHERE user_id = :userId "
            + "AND status IN ('paid', 'shipping', 'shipped', 'delivered', 'completed')", nativeQuery = true)
    BigDecimal getTotalAmountByUserId(@Param("userId") Integer userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderId = :orderId")
    java.util.Optional<Order> findByIdForUpdate(@Param("orderId") Integer orderId);
}
