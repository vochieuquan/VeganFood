package com.veganfood.veganfoodbackend.dto;

public class FeedbackResponseDTO {
    private String comment;
    private String userName;

    public FeedbackResponseDTO(String comment, String userName) {
        this.comment = comment;
        this.userName = userName;
    }

    public String getComment() { return comment; }
    public String getUserName() { return userName; }
}
