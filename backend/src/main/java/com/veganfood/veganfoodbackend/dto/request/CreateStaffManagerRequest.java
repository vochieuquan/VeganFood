package com.veganfood.veganfoodbackend.dto.request;

import com.veganfood.veganfoodbackend.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateStaffManagerRequest {
    @NotBlank(message = "Tên không được để trống")
    private String name;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotNull(message = "Role không được để trống")
    private User.Role role;

    private String phoneNumber;
    private String address;

    // Constructors
    public CreateStaffManagerRequest() {}

    public CreateStaffManagerRequest(String name, String email, String password, User.Role role, String phoneNumber, String address) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.address = address;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}