package com.veganfood.veganfoodbackend.dto;

import java.time.LocalDateTime;

public class FeedbackDTO {
    private String comment;
    private String userName;
    private LocalDateTime createdAt;

    // Constructors
    public FeedbackDTO() {}

    public FeedbackDTO(String comment, String userName, LocalDateTime createdAt) {
        this.comment = comment;
        this.userName = userName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
