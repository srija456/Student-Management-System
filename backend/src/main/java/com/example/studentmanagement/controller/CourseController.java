package com.example.studentmanagement.controller;

import com.example.studentmanagement.model.Course;
import com.example.studentmanagement.repository.CourseRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Get all courses
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Add a new course
    @PostMapping
    public Course addCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    // Update a course
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course) {

        return courseRepository.findById(id)
                .map(existingCourse -> {
                    existingCourse.setCourseName(course.getCourseName());
                    existingCourse.setCourseCode(course.getCourseCode());
                    existingCourse.setDuration(course.getDuration());
                    existingCourse.setDescription(course.getDescription());

                    return ResponseEntity.ok(
                            courseRepository.save(existingCourse));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a course
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {

        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
