package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByEmailIgnoreCase(String email);

    void deleteByEmailIgnoreCase(String email);
}
