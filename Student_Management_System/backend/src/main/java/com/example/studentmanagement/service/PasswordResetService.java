package com.example.studentmanagement.service;

import com.example.studentmanagement.model.PasswordResetOtp;
import com.example.studentmanagement.model.User;
import com.example.studentmanagement.repository.PasswordResetOtpRepository;
import com.example.studentmanagement.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${app.otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetOtpRepository otpRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendOtp(String suppliedEmail) {

        String email = suppliedEmail.trim().toLowerCase(Locale.ROOT);

        // Do not reveal whether an account exists.
        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        PasswordResetOtp record = otpRepository
                .findByEmailIgnoreCase(email)
                .orElseGet(PasswordResetOtp::new);

        if (record.getId() != null
                && record.getLastSentAt() != null
                && record.getLastSentAt().plusSeconds(
                        resendCooldownSeconds).isAfter(now)) {
            return;
        }

        String otp = String.format(
                "%06d", RANDOM.nextInt(1_000_000));

        record.setEmail(email);
        record.setOtpHash(passwordEncoder.encode(otp));
        record.setExpiresAt(now.plusMinutes(expiryMinutes));
        record.setLastSentAt(now);
        record.setAttempts(0);

        otpRepository.save(record);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(email);
            message.setSubject("EduSphere - Password Reset OTP");
            message.setText(
                    "Hello,\n\n"
                    + "Your EduSphere password reset OTP is: " + otp
                    + "\n\nThis OTP expires in " + expiryMinutes
                    + " minutes and can only be used once."
                    + "\n\nIf you did not request this, please ignore this email."
                    + "\n\nEduSphere Team"
            );

            mailSender.send(message);

        } catch (MailException ex) {
        	ex.printStackTrace();
            otpRepository.delete(record);
            throw new IllegalStateException(
                    "Unable to send OTP email. Check email configuration.");
        }
    }

    @Transactional(noRollbackFor=IllegalArgumentException.class)
    public void resetPassword(
            String suppliedEmail,
            String otp,
            String newPassword) {

        String email = suppliedEmail.trim().toLowerCase(Locale.ROOT);

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "New password must contain at least 8 characters.");
        }

        PasswordResetOtp record = otpRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired OTP."));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(record);
            throw new IllegalArgumentException("OTP has expired.");
        }

        if (record.getAttempts() >= maxAttempts) {
            otpRepository.delete(record);
            throw new IllegalArgumentException(
                    "Too many incorrect attempts. Request a new OTP.");
        }

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            record.setAttempts(record.getAttempts() + 1);

            if (record.getAttempts() >= maxAttempts) {
                otpRepository.delete(record);
                throw new IllegalArgumentException(
                        "Too many incorrect attempts. Request a new OTP.");
            }

            otpRepository.save(record);

            throw new IllegalArgumentException("Incorrect OTP.");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired OTP."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // OTP is deleted after successful password reset.
        otpRepository.delete(record);
    }
}
