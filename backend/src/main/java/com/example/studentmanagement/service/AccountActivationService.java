package com.example.studentmanagement.service;

import com.example.studentmanagement.model.AccountActivationOtp;
import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.model.User;

import com.example.studentmanagement.repository.AccountActivationOtpRepository;
import com.example.studentmanagement.repository.StudentRepository;
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
import java.util.Base64;
import java.util.Locale;

@Service
public class AccountActivationService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AccountActivationOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailUsername;

    @Value("${app.activation.expiry-minutes:10}")
    private int expiryMinutes;

    @Value("${app.activation.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    @Value("${app.activation.max-attempts:5}")
    private int maxAttempts;

    public AccountActivationService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            AccountActivationOtpRepository otpRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendActivationOtp(String suppliedEmail) {

        if (suppliedEmail == null || suppliedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        String email = suppliedEmail.trim().toLowerCase(Locale.ROOT);

        // 1. Find the student record
        Student student = studentRepository.findAll().stream()
                .filter(s -> s.getEmail() != null
                        && s.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No student record found with this email."));

        // 2. Find an existing login account
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElse(null);

        // 3. Create a login account if it does not exist
        if (user == null) {

            byte[] randomBytes = new byte[32];
            RANDOM.nextBytes(randomBytes);

            String temporaryPassword =
                    Base64.getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(randomBytes);

            user = new User();
            user.setEmail(student.getEmail());
            user.setPassword(passwordEncoder.encode(temporaryPassword));
            user.setRole("STUDENT");
            user.setStudentId(student.getId());
            user.setAccountActivated(false);

            user = userRepository.save(user);

        } else {

            if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
                throw new IllegalArgumentException(
                        "This email belongs to a non-student account.");
            }

            if (Boolean.TRUE.equals(user.getAccountActivated())) {
                throw new IllegalArgumentException(
                        "This student account is already activated.");
            }

            if (user.getStudentId() != null
                    && !user.getStudentId().equals(student.getId())) {
                throw new IllegalArgumentException(
                        "This login account is linked to another student.");
            }

            // Link an existing unlinked student account
            if (user.getStudentId() == null) {
                user.setStudentId(student.getId());
                userRepository.save(user);
            }
        }

        // 4. Generate and store OTP
        LocalDateTime now = LocalDateTime.now();

        AccountActivationOtp record = otpRepository
                .findByEmailIgnoreCase(email)
                .orElseGet(AccountActivationOtp::new);

        if (record.getId() != null
                && record.getLastSentAt() != null
                && record.getLastSentAt()
                        .plusSeconds(resendCooldownSeconds)
                        .isAfter(now)) {

            throw new IllegalArgumentException(
                    "Please wait before requesting another OTP.");
        }

        String otp = String.format(
                "%06d", RANDOM.nextInt(1_000_000));

        record.setEmail(email);
        record.setOtpHash(passwordEncoder.encode(otp));
        record.setExpiresAt(now.plusMinutes(expiryMinutes));
        record.setLastSentAt(now);
        record.setAttempts(0);

        otpRepository.save(record);

        // 5. Send activation email
        try {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(mailUsername);
            message.setTo(email);

            message.setSubject(
                    "EduSphere - Student Account Activation");

            message.setText(
                    "Hello " + student.getName() + ",\n\n"
                    + "Welcome to EduSphere!\n\n"
                    + "Your account activation OTP is: " + otp
                    + "\n\nThis OTP expires in " + expiryMinutes
                    + " minutes and can only be used once."
                    + "\n\nEnter this OTP in EduSphere to create your password."
                    + "\n\nEduSphere Team"
            );

            mailSender.send(message);

        } catch (MailException ex) {

            otpRepository.delete(record);

            throw new IllegalStateException(
                    "Unable to send activation email. Check email configuration.");
        }
    }

    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void activateAccount(
            String suppliedEmail,
            String otp,
            String newPassword) {

        if (suppliedEmail == null || suppliedEmail.isBlank()
                || otp == null || otp.isBlank()) {

            throw new IllegalArgumentException(
                    "Email and OTP are required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters.");
        }

        String email = suppliedEmail.trim().toLowerCase(Locale.ROOT);

        AccountActivationOtp record = otpRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or expired activation OTP."));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(record);

            throw new IllegalArgumentException(
                    "Activation OTP has expired.");
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

            throw new IllegalArgumentException(
                    "Incorrect activation OTP.");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student account not found."));

        if (!"STUDENT".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException(
                    "Only student accounts can be activated.");
        }

        if (Boolean.TRUE.equals(user.getAccountActivated())) {
            throw new IllegalArgumentException(
                    "This student account is already activated.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setAccountActivated(true);

        userRepository.save(user);

        // OTP must not be reusable
        otpRepository.delete(record);
    }
}