# 📚 Full-Stack Library Management System (MERN Stack)

A comprehensive, enterprise-grade **Library Management System** built using **MongoDB, Express.js, React, and Node.js (MERN Stack)**. This system features a multi-role architecture supporting both **Member 1 (Student Portal)** and **Member 2 (Librarian & Admin Portal)** with real-time stock tracking, automated overdue fine calculation, notification alerts, and fine receipt generation.

---

## 🌟 Key System Features

### 🎓 Member 1: Student Portal Features (Phases 1 – 10)
- **🔐 Secure Authentication & JWT Authorization**: Multi-role registration & login with 6-digit OTP verification (displayed in server console) and protected session tokens.
- **🔍 Advanced Book Search & Filters**: Live keyword search across Title, Author, ISBN, Book ID, and Category filters (*Computer Science, Mathematics, English, etc.*).
- **🛒 Shopping Cart & Issue Requests**: Add multiple books to cart or issue single books with real-time stock checks.
- **📋 Request Status Tracking**: Track issue request statuses (*Pending, Approved, Rejected*) with status badges.
- **📖 My Issued Books & Due Dates**: View active checked-out physical books with 14-day due date countdowns.
- **💳 Overdue Fine Summary**: Real-time breakdown of overdue fines calculated at **₹10 per day late**.
- **🔔 Real-time Notification Center**: Receive in-app student notifications for request approvals, rejections, due date reminders, and fine receipts (handled within the application).
- **📝 Search Missing Books & Complaints**: Request uncataloged titles or submit missing book complaints directly to the librarian.
- **⏳ Automated Waitlist Management**: Automatic queue assignment for out-of-stock books with notification alerts when stock becomes available.

---

### 🛡️ Member 2: Librarian & Admin Portal Features (Phases 11 – 18)
- **📊 Executive Analytics Dashboard**: Real-time KPI metrics for total catalog books, registered students, active issued books, pending requests, pending complaints, total fines collected, and unpaid overdue fines.
- **📚 Book Inventory Management (Full CRUD)**: Add, edit, update stock levels (`totalCopies`, `availableCopies`), and delete catalog books.
- **📋 Issue Request Approval & Rejection Workflow**: Review pending student requests, approve or reject with custom reasons, and trigger automated student notifications.
- **📖 Physical Counter Checkout**: Hand over physical copies at the library counter, assign 14-day return due dates, and decrement shelf stock.
- **📥 Return Processing & Automated Overdue Fine Engine**: Accept book returns, automatically compute late fines (**₹10/day**), and restore shelf stock.
- **💳 Fine Payment Settlement & Digital Receipts**: Mark fines as `Paid`, record librarian auditor ID, and generate digital payment receipts (`Receipt No: F-PAID-XXXXXX`).
- **🎓 Student Directory & Account Controls**: Manage student records formatted as **`Surname FirstName`** (`Sharma Rahul`, `Patel Priya`, `Deshmukh Vaishnavi`), view active activity metrics, and toggle account suspension (`isActive`).

---

## 🗄️ Database Architecture (`Final Database Design.pdf` Aligned)

| Collection | Key Attributes | Purpose |
| :--- | :--- | :--- |
| **`Users`** | `studentId`, `name` (`Surname FirstName`), `email`, `password`, `role`, `phone`, `department`, `isActive`, `createdAt` | Authentication, multi-role access & directory management |
| **`Books`** | `bookId`, `title`, `author`, `category`, `isbn`, `publisher`, `year`, `totalCopies`, `availableCopies`, `description`, `img`, `quantity`, `borrowed` | Catalog inventory & physical shelf stock tracking |
| **`Transactions`** | `userId`, `bookId`, `user`, `book`, `requestDate`, `requestStatus`, `issueDate`, `dueDate`, `returnDate`, `status`, `fineAmount`, `fineStatus`, `finePaidDate`, `adminVerifiedBy` | Book issues, physical checkouts, returns & fine ledgers |
| **`Notifications`** | `userId`, `title`, `message`, `type`, `isRead`, `createdAt` | Student notification inbox alerts |
| **`LibraryRequests`** | `userId`, `bookTitle`, `author`, `publisher`, `category`, `description`, `requestType`, `status` | Missing book requests & student complaints |
| **`WaitingLists`** | `userId`, `bookId`, `position`, `status` | Out-of-stock book waitlist queue |

---

## 🔑 Default Demo Credentials

### 🛡️ Administrator Account
- **Email**: `admin@library.com`
- **Password**: `admin123`
- *Or click `🔑 Fill Admin Credentials` on the login page.*

### 🎓 Student Demo Account
- **Email**: `vaishnavi123@gmail.com`
- **Password**: `password123`
- *Or click `🔑 Fill Student Credentials` on the login page.*

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Running locally on `mongodb://127.0.0.1:27017/library_management_db` or MongoDB Atlas URI)

### 2. Clone Repository
```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

### 3. Server Configuration & Setup
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/library_management_db
JWT_SECRET=your_jwt_secret_key_here
```

Start backend server:
```bash
npm start
```
*(Backend runs on `http://localhost:8080`)*

### 4. Client Setup & Development Server
Open a new terminal tab:
```bash
cd client
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 🧪 Testing & Verification

- **Production Client Build Test**:
  ```bash
  cd client
  npm run build
  ```
  *(Compiles cleanly with zero errors)*

---

## 📜 License

This project is licensed under the **MIT License**.
