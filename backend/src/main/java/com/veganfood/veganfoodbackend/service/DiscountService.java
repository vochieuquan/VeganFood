package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.model.Discount;
import com.veganfood.veganfoodbackend.repository.DiscountRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public Discount create(Discount discount) {
        if (discount.getDiscountCode() == null || discount.getDiscountCode().isBlank()
                || discount.getQuantity() == null || discount.getQuantity() <= 0
                || discount.getPercentage() == null || discount.getPercentage() < 1 || discount.getPercentage() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount code, positive quantity, and percentage from 1 to 100 are required");
        }
        discount.setDiscountCode(discount.getDiscountCode().trim().toUpperCase());
        if (discountRepository.findByDiscountCode(discount.getDiscountCode()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Discount code already exists");
        }
        discount.setStatus(Discount.Status.Available);
        discount.setCreatedAt(java.time.LocalDateTime.now());
        return discountRepository.save(discount);
    }

    public List<Discount> getAll() {
        return discountRepository.findAll();
    }

    public Optional<Discount> findByCode(String code) {
        return discountRepository.findByDiscountCode(code.trim().toUpperCase());
    }

    @Transactional
    public Discount useDiscount(String code) {
        Discount discount = discountRepository.findByDiscountCodeForUpdate(code.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (discount.getStatus() != Discount.Status.Available || discount.getQuantity() <= 0) {
            throw new RuntimeException("Mã giảm giá không còn khả dụng");
        }

        discount.setQuantity(discount.getQuantity() - 1);
        if (discount.getQuantity() == 0) {
            discount.setStatus(Discount.Status.Unavailable);
        }

        return discountRepository.save(discount);
    }

    public Discount updateStatus(Integer id, Discount.Status status) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount status is required");
        }
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã"));

        discount.setStatus(status);
        return discountRepository.save(discount);
    }
}
