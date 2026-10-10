package com.veganfood.veganfoodbackend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.veganfood.veganfoodbackend.dto.GoogleLoginDTO;
import com.veganfood.veganfoodbackend.dto.request.AuthRequest;
import com.veganfood.veganfoodbackend.dto.response.AuthResponse;
import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.repository.UserRepository;
import com.veganfood.veganfoodbackend.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final String googleClientId;

    public AuthController(UserRepository userRepository,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.google.client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase()).orElse(null);
        if (user == null || user.getRole() == User.Role.customer
                || user.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user.getEmail()),
                user.getEmail(), user.getRole().name()));
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginDTO googleData) {
        if (googleClientId.isBlank() || googleData.getCredential() == null || googleData.getCredential().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google sign-in is not configured");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(googleData.getCredential());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google credential");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            Object emailVerified = payload.get("email_verified");
            String email = payload.getEmail() == null ? null : payload.getEmail().trim().toLowerCase();
            if (email == null || !Boolean.parseBoolean(String.valueOf(emailVerified))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google email is not verified");
            }

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(String.valueOf(payload.getOrDefault("name", email)));
                newUser.setRole(User.Role.customer);
                newUser.setPhoneNumber("");
                newUser.setAddress("");
                return userRepository.save(newUser);
            });

            if (user.getRole() != User.Role.customer) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("This account cannot use customer sign-in");
            }
            return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(email), email, user.getRole().name()));
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google sign-in verification failed");
        }
    }
}
