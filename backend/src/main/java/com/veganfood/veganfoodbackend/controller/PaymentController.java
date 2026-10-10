package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.model.Order;
import com.veganfood.veganfoodbackend.repository.OrderRepository;
import com.veganfood.veganfoodbackend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    public PaymentController(PaymentService paymentService, OrderRepository orderRepository) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/create/{orderId}")
    public ResponseEntity<?> createPayment(@PathVariable Integer orderId, Authentication authentication) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        if (authentication == null || !order.getUser().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Order access denied");
        }
        if (order.getPaymentMethod() != Order.PaymentMethod.VNPAY
                || order.getStatus() != Order.OrderStatus.pending) {
            return ResponseEntity.badRequest().body("Order is not awaiting online payment");
        }
        try {
            return ResponseEntity.ok(Map.of("checkoutUrl", paymentService.createPaymentLink(
                    order.getOrderId(), order.getTotalAmount(), order.getUser().getName())));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Unable to start payment");
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> paymentWebhook(@RequestBody Map<String, Object> payload) {
        try {
            paymentService.handleWebhook(payload);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException exception) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
