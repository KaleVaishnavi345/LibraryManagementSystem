# 📚 Library Management System

A full-stack **Library Management System** developed using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

The system provides separate **Student** and **Librarian/Admin** portals for managing books, requests, transactions, fines, notifications, and student accounts.

---

## 👥 Project Team

### Member 1 — Student Portal
- Student registration & login
- JWT authentication
- 6-digit OTP verification
- Book search & filtering
- Cart
- Book issue requests
- Request status
- Issued books & due dates
- Fine calculation
- Student notifications
- Missing book requests/complaints
- Waitlist

### Member 2 — Librarian & Admin Portal
- Admin authentication
- Analytics dashboard
- Book inventory CRUD
- Request approval/rejection
- Student notifications
- Physical checkout
- Book return
- Fine management
- Fine payment & receipts
- Student directory
- Student account management

### Member 3 — Frontend, UI/UX & Modifications
- Student & Admin dashboards
- Login, registration & OTP UI
- Book, cart & request interfaces
- Notification interface
- Responsive design
- Frontend-backend API integration
- Form validation & error handling
- UI/UX improvements
- Frontend bug fixes
- Required modifications and updates

---

# 🚀 Main Features

### Student Portal
- Registration & OTP verification
- Login
- Search/filter books
- Cart
- Book requests
- Request status
- Issued books & due dates
- ₹10/day overdue fine
- Notifications
- Missing book requests
- Waitlist

### Admin/Librarian Portal
- Dashboard & analytics
- Book inventory management
- Approve/reject requests
- Book checkout and return
- Fine management
- Fine payment & receipts
- Student management
- Send student notifications

---

# 🔔 Notifications

Admins can send notifications to individual students.

The notification is stored in **MongoDB** and displayed in the student's notification center.

For development, the backend also displays:

```text
========================================
      STUDENT NOTIFICATION SENT
========================================
Student : Test Student
Email   : teststudent@gmail.com
Subject : Book Request Update
Message : Your book request has been approved.
Status  : Notification sent to student account
========================================
```

> This is a console simulation and does not send an actual email.

---

# 🔐 Authentication & OTP

The system uses:

- JWT authentication
- bcrypt password hashing
- Role-based authorization
- 6-digit OTP verification

OTP validity: **10 minutes**

For development, the OTP is displayed in the backend console instead of being sent through email.

Public registration always creates a **student account**. Admin accounts are managed separately.

---

# 🗂️ Database

**MongoDB** is used as the database.

Main collections:

```text
Users
Books
Transactions
Notifications
LibraryRequests
WaitingLists
```

---

# 🛠️ Technology Stack

**Frontend:** React.js, JavaScript, HTML, CSS

**Backend:** Node.js, Express.js, REST APIs

**Database:** MongoDB, Mongoose

**Authentication:** JWT, bcrypt, OTP

**Tools:** Git, GitHub, VS Code, MongoDB Atlas/Community Server

---

# 📋 Prerequisites

Install the following before running the project:

- **Node.js 18+**
- **npm**
- **MongoDB / MongoDB Atlas**
- **Git**
- **VS Code** or any code editor
- **Modern web browser**

Project dependencies can be installed using:

```bash
npm install
```

---

# ⚙️ Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Library-Management-System
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

Backend:

```text
http://localhost:8080
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Environment Variables

Create `.env` in the backend:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

> Do not upload `.env` or passwords/secrets to GitHub.

---

# 🔑 Demo Credentials

### Admin

```text
Email    : admin@library.com
Password : admin123
```

### Student

```text
Email    : vaishnavi123@gmail.com
Password : password123
```

---

# 📁 Project Structure

```text
Library-Management-System/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── index.js
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# 👥 Responsibility Summary

| Member | Responsibility |
|---|---|
| **Member 1** | Student Portal & Student Features |
| **Member 2** | Librarian/Admin Portal & Management |
| **Member 3** | Frontend, UI/UX, Integration & Modifications |

---

# 📄 License / Usage

This project is developed as a **college academic project**.

It uses open-source technologies and packages whose respective licenses and terms apply. The project is intended primarily for **educational purposes**.

---

# 🎯 Objective

The objective of this project is to provide a centralized web-based platform for managing library operations digitally, reducing manual work and improving interaction between students and library administrators.
