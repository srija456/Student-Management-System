package com.example.studentmanagement.repository;

import com.example.studentmanagement.model.AccountActivationOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountActivationOtpRepository
        extends JpaRepository<AccountActivationOtp, Long> {

    Optional<AccountActivationOtp> findByEmailIgnoreCase(String email);

    void deleteByEmailIgnoreCase(String email);
}