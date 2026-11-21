# Student Management System

A learning/demo project using React, Spring Boot, Spring Data JPA and MySQL.

## Requirements
- JDK 17 or 21 (recommended)
- Maven (Eclipse can import the Maven project)
- MySQL Server
- Node.js and npm

## Database
Run `database/create_database.sql` in MySQL Workbench.

## Backend
1. Open Eclipse: File > Import > Maven > Existing Maven Projects.
2. Select the `backend` folder and import `pom.xml`.
3. Edit `backend/src/main/resources/application.properties` and enter your MySQL password.
4. Run `StudentManagementApplication.java` as Java Application.
5. Backend URL: http://localhost:8080

## Frontend
1. Open the `frontend` folder in VS Code.
2. Open a terminal in that folder.
3. Run `npm.cmd install` (PowerShell) or `npm install` (Command Prompt).
4. Run `npm.cmd run dev` (PowerShell) or `npm run dev` (Command Prompt).
5. Open the URL printed by Vite, usually http://localhost:5173.

## API endpoints
- GET `/api/students`
- GET `/api/students?q=searchText`
- GET `/api/students/{id}`
- POST `/api/students`
- PUT `/api/students/{id}`
- DELETE `/api/students/{id}`

This is an academic demo, not production-ready. Validate inputs and test in your own environment.
