package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.model.Discount;
import com.veganfood.veganfoodbackend.service.DiscountService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    // ✅ Chỉ owner, manager, staff được phép tạo discount
    @PostMapping
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public Discount createDiscount(@RequestBody Discount discount) {
        return discountService.create(discount);
    }

    // ✅ Xem toàn bộ mã giảm giá
    @GetMapping
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public List<Discount> getAllDiscounts() {
        return discountService.getAll();
    }

    // ✅ Lấy discount theo mã
    @GetMapping("/code/{code}")
    public Discount getDiscountByCode(@PathVariable String code) {
        return discountService.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã"));
    }

    // ✅ Sử dụng discount: trừ quantity và cập nhật status
    @PutMapping("/use/{code}")
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public Discount useDiscount(@PathVariable String code) {
        return discountService.useDiscount(code);
    }

    // ✅ Cập nhật trạng thái discount
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('owner', 'manager')")
    public Discount updateStatus(@PathVariable Integer id, @RequestParam Discount.Status status) {
        return discountService.updateStatus(id, status);
    }
}
