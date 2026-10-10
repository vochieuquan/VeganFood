package com.veganfood.veganfoodbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateFeedbackDTO {

    @NotNull(message = "Product ID is required")
    private Integer productId;

    @NotBlank(message = "Comment is required")
    private String comment;

    // Constructors
    public CreateFeedbackDTO() {}

    public CreateFeedbackDTO(Integer productId, String comment) {
        this.productId = productId;
        this.comment = comment;
    }

    // Getters and Setters
    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    @Override
    public String toString() {
        return "CreateFeedbackDTO{" +
                "productId=" + productId +
                ", comment='" + comment + '\'' +
                '}';
    }
}
