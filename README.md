EduSphere -- Student Management System

A full-stack Student Management System developed using React, Java
Spring Boot, Spring Data JPA and MySQL. The application provides
separate Admin and Student access, student record management and account
authentication.


🚀 Key Features

Authentication and Account Management


Separate Admin and Student login

JWT-based authentication

OTP-based student account activation

Forgot password functionality

Password reset using OTP

Secure password storage


Admin Module


Admin dashboard

Add and manage student records

View, update and delete student details

Search student records


Student Module


Student login

Individual Student Dashboard

Access to the student portal after account activation


Student Management


Complete CRUD operations

Student information management

MySQL database integration


🛠️ Technology Stack

  Layer               Technologies



  Frontend            React, JavaScript, HTML, CSS
  Backend             Java, Spring Boot
  ORM                 Spring Data JPA, Hibernate
  Database            MySQL
  Authentication      JWT, OTP
  Development Tools   VS Code, Eclipse, MySQL Workbench, Postman
  Build Tool          Maven


📁 Project Structure

Student-Management-System/
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── package.json
│   └── index.html
├── database/
├── docs/
├── .gitignore
└── README.md

⚙️ Requirements


JDK 17 or above

Maven

MySQL Server

Node.js and npm

Eclipse IDE

Visual Studio Code


🗄️ Database Setup


Open MySQL Workbench.

Run database/create_database.sql.

Configure your MySQL database credentials in backend/src/main/resources/application.properties.

Start MySQL Server.


▶️ Backend Setup


Open Eclipse IDE.

Select File → Import → Maven → Existing Maven Projects.

Select the backend folder and import the project.

Configure database credentials.

Run StudentManagementApplication.java as a Java Application.


Backend URL: http://localhost:8080


▶️ Frontend Setup


Open the frontend folder in VS Code.

Open the integrated terminal.

Install dependencies:


npm install

For PowerShell, use npm.cmd install.



Start the frontend:


npm run dev

For PowerShell, use npm.cmd run dev.


Frontend URL: http://localhost:5173


🔗 Student Management API Endpoints

  Method   Endpoint                       Description



  GET      /api/students                Get all students
  GET      /api/students?q=searchText   Search students
  GET      /api/students/{id}           Get student by ID
  POST     /api/students                Add a student
  PUT      /api/students/{id}           Update student
  DELETE   /api/students/{id}           Delete student


🔐 Authentication

The application includes JWT-based authentication, OTP account
activation and password reset functionality. Admin and Student users
have separate login access and dashboards.


🎯 Project Objective

The objective of EduSphere is to simplify student record management and
provide an organized digital platform for administrators and students
through a full-stack web application.


👩‍💻 Developer

Bodigam Srija


GitHub: https://github.com/srija456


📌 Disclaimer

This project was developed for academic and learning purposes. Review
security configurations and environment-specific settings before
production deployment.