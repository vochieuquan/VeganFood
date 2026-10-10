package com.veganfood.veganfoodbackend.controller;

import com.veganfood.veganfoodbackend.dto.FeedbackDTO;
import com.veganfood.veganfoodbackend.dto.CreateFeedbackDTO;
import com.veganfood.veganfoodbackend.service.FeedbackService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // ✅ GET: Lấy feedback theo productId
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getFeedbackByProduct(@PathVariable Integer productId) {
        try {
            System.out.println("Getting feedback for product ID: " + productId);
            List<FeedbackDTO> feedbacks = feedbackService.getFeedbackByProductId(productId);
            System.out.println("Found " + feedbacks.size() + " feedbacks");
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ✅ POST: Tạo mới feedback
    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody @Valid CreateFeedbackDTO dto) {
        try {
            System.out.println("Creating feedback: " + dto);
            FeedbackDTO created = feedbackService.createFeedback(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            System.out.println("Error creating feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // ✅ DELETE: Xóa feedback theo ID
    @DeleteMapping("/{feedbackId}")
    @PreAuthorize("hasAnyRole('owner', 'manager', 'staff')")
    public ResponseEntity<?> deleteFeedback(@PathVariable Integer feedbackId) {
        try {
            feedbackService.deleteFeedback(feedbackId);
            return ResponseEntity.ok("Deleted feedback with ID: " + feedbackId);
        } catch (Exception e) {
            System.out.println("Error deleting feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting feedback: " + e.getMessage());
        }
    }
}
