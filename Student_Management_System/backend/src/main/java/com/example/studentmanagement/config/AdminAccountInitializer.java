package com.example.studentmanagement.config;

import com.example.studentmanagement.model.User;
import com.example.studentmanagement.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminAccountInitializer {

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (adminEmail.isBlank() || adminPassword.isBlank()) {
                System.out.println("Admin setup skipped: credentials not configured.");
                return;
            }

            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setPassword(
                    passwordEncoder.encode(adminPassword)
                );
                admin.setRole("ADMIN");
                admin.setStudentId(null);

                userRepository.save(admin);

                System.out.println("Initial admin account created.");
            }
        };
    }
}
