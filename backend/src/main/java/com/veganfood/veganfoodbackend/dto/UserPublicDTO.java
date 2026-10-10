package com.veganfood.veganfoodbackend.dto;

public class UserPublicDTO {
    private String name;
    private String email;
    private String phoneNumber;
    private String address;

    public UserPublicDTO(String name, String email, String phoneNumber, String address) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }


    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddress() {
        return address;
    }
}
