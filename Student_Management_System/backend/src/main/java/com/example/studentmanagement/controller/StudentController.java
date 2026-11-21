package com.example.studentmanagement.controller;
import com.example.studentmanagement.service.AccountActivationService;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.studentmanagement.model.Student;
import com.example.studentmanagement.model.User;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountActivationService activationService;
    
    public StudentController(
            StudentRepository repository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AccountActivationService activationService) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.activationService = activationService;
    }

    // Get all students and search students
    @GetMapping
    public List<Student> getAll(
            @RequestParam(required = false) String q) {

        return (q == null || q.isBlank())
                ? repository.findAll()
                : repository.search(q.trim());
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getOne(
            @PathVariable Long id) {

        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Existing student creation endpoint - preserved
    @PostMapping
    public Student create(@Valid @RequestBody Student student) {

        student.setId(null);
        return repository.save(student);
    }

    // Create student and login account together
    @PostMapping("/create-with-account")
    @Transactional
    public ResponseEntity<?> createWithAccount(
            @RequestBody StudentAccountRequest request) {

        // Validate required fields
        if (request.name == null || request.name.isBlank()
                || request.email == null || request.email.isBlank()) {

            return ResponseEntity.badRequest().body(
                    "Name and email are required.");
        }

        String email = request.email.trim();

        // Check for duplicate student or user email
        boolean studentExists = repository.findAll().stream()
                .anyMatch(s -> s.getEmail() != null
                        && s.getEmail().equalsIgnoreCase(email));

        if (studentExists
                || userRepository.existsByEmailIgnoreCase(email)) {

            return ResponseEntity.badRequest().body(
                    "A student or login account already exists with this email.");
        }

        // Create student record
        Student student = new Student();

        student.setName(request.name.trim());
        student.setEmail(email);
        student.setPhone(request.phone);
        student.setCourse(request.course);
        student.setYear(request.year);

        Student savedStudent = repository.save(student);

        // Generate a random temporary password
        byte[] randomBytes = new byte[32];

        new SecureRandom().nextBytes(randomBytes);

        String temporaryPassword =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);

        // Create student login account
        User user = new User();

        user.setEmail(savedStudent.getEmail());

        user.setPassword(
                passwordEncoder.encode(temporaryPassword));

        user.setRole("STUDENT");
        user.setStudentId(savedStudent.getId());
        user.setAccountActivated(false);

        userRepository.save(user);

        // Send activation OTP to the student's email.
        activationService.sendActivationOtp(user.getEmail());

        return ResponseEntity.ok(
                "Student and login account created successfully. Student ID: "
                        + savedStudent.getId());
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<Student> update(
            @PathVariable Long id,
            @Valid @RequestBody Student input) {

        return repository.findById(id).map(existing -> {

            existing.setName(input.getName());
            existing.setEmail(input.getEmail());
            existing.setPhone(input.getPhone());
            existing.setCourse(input.getCourse());
            existing.setYear(input.getYear());

            return ResponseEntity.ok(repository.save(existing));

        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete student and linked login account
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.findAll().stream()
                .filter(user -> user.getStudentId() != null
                        && user.getStudentId().equals(id))
                .forEach(userRepository::delete);

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // Request class
    public static class StudentAccountRequest {

        public String name;
        public String email;
        public String phone;
        public String course;
        public Integer year;
    }
}