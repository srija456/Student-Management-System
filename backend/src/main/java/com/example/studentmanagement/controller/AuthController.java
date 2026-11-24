package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.User;
import com.example.studentmanagement.service.AuthService;
import com.example.studentmanagement.service.AccountActivationService;
import com.example.studentmanagement.config.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AccountActivationService activationService;

    public AuthController(
            AuthService authService,
            JwtUtil jwtUtil,
            AccountActivationService activationService) {

        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.activationService = activationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        try {
            User user = authService.register(
                request.email,
                request.password,
                "STUDENT",
                request.studentId
            );

            return ResponseEntity.ok(
                new AuthResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    null
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            User user = authService.login(
                request.email,
                request.password
            );

            String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
            );

            return ResponseEntity.ok(
                new AuthResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getRole(),
                    token
                )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/activation/send")
    public ResponseEntity<?> sendActivationOtp(
            @RequestBody ActivationRequest request) {
        try {
            activationService.sendActivationOtp(request.email);

            return ResponseEntity.ok(
                "Activation OTP sent successfully to your email.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (IllegalStateException e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/activation/verify")
    public ResponseEntity<?> activateAccount(
            @RequestBody ActivationRequest request) {
        try {
            activationService.activateAccount(
                request.email,
                request.otp,
                request.newPassword
            );

            return ResponseEntity.ok(
                "Student account activated successfully. You can now log in.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class AuthRequest {
        public String email;
        public String password;
        public Long studentId;
    }

    public static class ActivationRequest {
        public String email;
        public String otp;
        public String newPassword;
    }

    public static class AuthResponse {
        public Long id;
        public String email;
        public String role;
        public String token;

        public AuthResponse(
            Long id, String email, String role, String token
        ) {
            this.id = id;
            this.email = email;
            this.role = role;
            this.token = token;
        }
    }
}