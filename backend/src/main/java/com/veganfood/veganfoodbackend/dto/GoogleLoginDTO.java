package com.veganfood.veganfoodbackend.dto;

public class GoogleLoginDTO {
    private String credential;

    public GoogleLoginDTO() {
    }

    public GoogleLoginDTO(String credential) {
        this.credential = credential;
    }

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }
}
