package com.example.studentmanagement.controller;

import com.example.studentmanagement.service.PasswordResetService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(
            PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        if (request.email == null || request.email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email is required.");
        }

        try {
            passwordResetService.sendOtp(request.email);

            return ResponseEntity.ok(
                    "If an account exists for that email, an OTP has been sent."
            );

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Unable to send email. Please try again later.");
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        if (request.email == null || request.otp == null
                || request.newPassword == null) {
            return ResponseEntity.badRequest()
                    .body("Email, OTP and new password are required.");
        }

        try {
            passwordResetService.resetPassword(
                    request.email,
                    request.otp,
                    request.newPassword
            );

            return ResponseEntity.ok(
                    "Password reset successfully. Please log in again."
            );

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    public static class ForgotPasswordRequest {
        public String email;
    }

    public static class ResetPasswordRequest {
        public String email;
        public String otp;
        public String newPassword;
    }
}
