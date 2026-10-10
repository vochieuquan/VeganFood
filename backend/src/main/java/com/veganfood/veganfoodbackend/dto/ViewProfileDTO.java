package com.veganfood.veganfoodbackend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ViewProfileDTO {
    private String email;
    private String name;
    private String phoneNumber;
    private String address;
    private LocalDate birthDate; // ✅ Ngày sinh
    private String gender;
    private LocalDateTime created_at;// ✅ Giới tính

    public ViewProfileDTO(String email, String name, String phoneNumber, String address, LocalDate birthDate, String gender, LocalDateTime created_at) {
        this.email = email;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.birthDate = birthDate;
        this.gender = gender;
        this.created_at = created_at;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getGender() {
        return gender;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }
}
