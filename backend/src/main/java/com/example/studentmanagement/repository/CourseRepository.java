package com.example.studentmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.studentmanagement.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

}
