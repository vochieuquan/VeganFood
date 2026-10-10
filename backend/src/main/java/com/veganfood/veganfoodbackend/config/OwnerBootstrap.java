package com.veganfood.veganfoodbackend.config;

import com.veganfood.veganfoodbackend.model.User;
import com.veganfood.veganfoodbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class OwnerBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String ownerEmail;
    private final String ownerPassword;

    public OwnerBootstrap(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.bootstrap.owner-email:}") String ownerEmail,
                          @Value("${app.bootstrap.owner-password:}") String ownerPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.ownerEmail = ownerEmail;
        this.ownerPassword = ownerPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.countByRole(User.Role.owner) > 0) {
            return;
        }
        if (ownerEmail.isBlank() || ownerEmail.length() > 100 || ownerPassword.length() < 14
                || ownerPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException(
                    "Set a valid BOOTSTRAP_OWNER_EMAIL and a BOOTSTRAP_OWNER_PASSWORD of 14 to 72 UTF-8 bytes for the first startup");
        }
        String normalizedEmail = ownerEmail.trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalStateException("The bootstrap owner email already belongs to a non-owner account");
        }

        User owner = new User();
        owner.setName(normalizedEmail);
        owner.setEmail(normalizedEmail);
        owner.setPassword(passwordEncoder.encode(ownerPassword));
        owner.setRole(User.Role.owner);
        owner.setPhoneNumber("");
        owner.setAddress("");
        userRepository.save(owner);
    }
}
