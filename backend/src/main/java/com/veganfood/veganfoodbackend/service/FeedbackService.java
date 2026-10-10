package com.veganfood.veganfoodbackend.service;

import com.veganfood.veganfoodbackend.dto.FeedbackDTO;
import com.veganfood.veganfoodbackend.dto.CreateFeedbackDTO;
import com.veganfood.veganfoodbackend.model.Feedback;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.model.Product;
import com.veganfood.veganfoodbackend.repository.FeedbackRepository;
import com.veganfood.veganfoodbackend.repository.UserRepository;
import com.veganfood.veganfoodbackend.repository.ProductRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public FeedbackService(FeedbackRepository feedbackRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<FeedbackDTO> getFeedbackByProductId(Integer productId) {
        try {
            List<Feedback> feedbackList = feedbackRepository.findByProductId(productId);
            return feedbackList.stream()
                    .map(f -> {
                        String userName = "Anonymous";
                        try {
                            if (f.getUser() != null && f.getUser().getName() != null) {
                                userName = f.getUser().getName();
                            }
                        } catch (Exception e) {
                            System.out.println("Error getting user name: " + e.getMessage());
                        }

                        return new FeedbackDTO(
                                f.getComment(),
                                userName,
                                f.getCreatedAt()
                        );
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get feedback for product " + productId, e);
        }
    }

    // ✅ Tạo feedback mới - Lấy user từ JWT token
    @Transactional
    public FeedbackDTO createFeedback(CreateFeedbackDTO createFeedbackDTO) {
        try {
            // ✅ Lấy username từ JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName(); // ✅ lấy email từ token
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));


            // ✅ Tìm product
            Product product = productRepository.findById(createFeedbackDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + createFeedbackDTO.getProductId()));

            // ✅ Tạo feedback mới
            Feedback feedback = new Feedback();
            feedback.setUser(user);
            feedback.setProduct(product);
            feedback.setComment(createFeedbackDTO.getComment());
            feedback.setCreatedAt(LocalDateTime.now());

            Feedback savedFeedback = feedbackRepository.save(feedback);

            return new FeedbackDTO(
                    savedFeedback.getComment(),
                    savedFeedback.getUser().getName(),
                    savedFeedback.getCreatedAt()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create feedback", e);
        }
    }

    public List<FeedbackDTO> getAllFeedback() {
        try {
            List<Feedback> feedbackList = feedbackRepository.findAll();
            return feedbackList.stream()
                    .map(f -> {
                        String userName = "Anonymous";
                        try {
                            if (f.getUser() != null && f.getUser().getName() != null) {
                                userName = f.getUser().getName();
                            }
                        } catch (Exception e) {
                            System.out.println("Error getting user name: " + e.getMessage());
                        }

                        return new FeedbackDTO(
                                f.getComment(),
                                userName,
                                f.getCreatedAt()
                        );
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get all feedback", e);
        }
    }

    @Transactional
    public void deleteFeedback(Integer feedbackId) {
        try {
            if (!feedbackRepository.existsById(feedbackId)) {
                throw new RuntimeException("Feedback not found with ID: " + feedbackId);
            }
            feedbackRepository.deleteById(feedbackId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete feedback", e);
        }
    }
}
