package com.veganfood.veganfoodbackend.dto;

import com.veganfood.veganfoodbackend.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDTO {
    private Integer userId;
    private String name;
    private String email;
    private User.Role role;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;

    private BigDecimal totalAmount; // ✅ Thêm dòng này

    public UserDTO() {
        // Bắt buộc để Jackson khởi tạo
    }

    public UserDTO(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.phoneNumber = user.getPhoneNumber();
        this.createdAt = user.getCreatedAt();
        this.address = user.getAddress();
        this.dateOfBirth = user.getDateOfBirth();
        this.gender = user.getGender();
    }

    // Getters
    public Integer getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public User.Role getRole() { return role; }
    public String getPhoneNumber() { return phoneNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getAddress() { return address; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public String getGender() { return gender; }
    public BigDecimal getTotalAmount() { return totalAmount; } // ✅ Getter cho totalAmount

    // Setter cho totalAmount
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
