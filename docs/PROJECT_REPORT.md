# STUDENT MANAGEMENT SYSTEM – PROJECT REPORT

## 1. Abstract
The Student Management System is a web-based application designed to maintain student information digitally. It provides operations to add, view, update, delete and search student records. The React frontend communicates with a Java Spring Boot REST API, while Spring Data JPA stores records in a MySQL database.

## 2. Problem Statement
Maintaining student details manually can lead to duplicated records, difficulty in searching and slower updates. This project provides a simple centralized application for managing student information.

## 3. Objectives
- Develop a user-friendly student record interface.
- Implement CRUD operations.
- Connect React with Spring Boot REST APIs.
- Store student information in MySQL using Spring Data JPA.
- Test API endpoints using Postman.

## 4. Technologies
Frontend: React, JavaScript, HTML, CSS, Vite.
Backend: Java, Spring Boot, Spring Web, Spring Data JPA.
Database: MySQL.
Tools: Eclipse, VS Code, MySQL Workbench, Postman, Git/GitHub.

## 5. Modules
1. Add Student – saves name, email, phone, course and year.
2. View Students – displays stored records.
3. Update Student – edits an existing record.
4. Delete Student – removes a selected record.
5. Search Student – filters records by name, email or course.

## 6. Architecture
User → React UI → HTTP/REST API → Spring Boot Controller → Spring Data JPA Repository → MySQL Database.

## 7. Database
Database: student_management. Table: students. Fields: id (primary key), name, email, phone, course, year. Hibernate can create/update the table from the Student entity.

## 8. API Endpoints
GET /api/students – list records.
GET /api/students?q=value – search.
GET /api/students/{id} – get one record.
POST /api/students – create.
PUT /api/students/{id} – update.
DELETE /api/students/{id} – delete.

## 9. Testing
Test each endpoint in Postman and verify that changes appear in the React UI and MySQL database. Test valid inputs, missing records, duplicate email and invalid email.

## 10. Advantages
Centralized records, faster search, easier updates, reduced manual work and clear separation between frontend, backend and database.

## 11. Limitations and Future Scope
This academic version does not include authentication, role-based access, pagination or deployment. Future improvements can add login, admin/student roles, export to Excel/PDF, audit logs and cloud deployment.

## 12. Conclusion
The project demonstrates full-stack application development using React, Java Spring Boot, Spring Data JPA and MySQL. It provides the core operations required to manage student records.
