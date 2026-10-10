package com.veganfood.veganfoodbackend.repository;

import com.veganfood.veganfoodbackend.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.List;

public interface DiscountRepository extends JpaRepository<Discount, Integer>{
    Optional<Discount> findByDiscountCode(String discountCode);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Discount d where d.discountCode = :code")
    Optional<Discount> findByDiscountCodeForUpdate(@Param("code") String code);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Discount d where d.discountId = :id")
    Optional<Discount> findByDiscountIdForUpdate(@Param("id") Integer id);
    List<Discount> findByStatus(Discount.Status status);
}
