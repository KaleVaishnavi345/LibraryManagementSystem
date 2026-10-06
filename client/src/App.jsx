import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Notfound from "./components/Auth/Notfound";

// Student Components
import Home from "./components/User/Home/Home";
import Cart from "./components/User/Cart/Cart";
import MyRequests from "./components/User/Requests/MyRequests";
import IssuedBooks from "./components/User/IssuedBooks/IssuedBooks";
import Waitlist from "./components/User/Waitlist/Waitlist";
import Notifications from "./components/User/Notifications/Notifications";
import LibraryRequests from "./components/User/LibraryRequests/LibraryRequests";

// Admin Components
import Admin from "./components/Admin/Home/Admin";
import Add from "./components/Admin/AddBook/Add";
import ViewBook from "./components/Admin/ViewBook/ViewBook";
import ViewUser from "./components/Admin/ViewUser/ViewUser";
import IssueRequests from "./components/Admin/Requests/IssueRequests";
import PhysicalIssue from "./components/Admin/IssueBook/PhysicalIssue";
import ReturnBook from "./components/Admin/ReturnBook/ReturnBook";
import ManageFines from "./components/Admin/Fines/ManageFines";

// Route Guard
import ProtectedRoute from "./components/Common/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* Protected Student Routes */}
      <Route
        path="/welcome"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <MyRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-issued"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <IssuedBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waitlist"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <Waitlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library-requests"
        element={
          <ProtectedRoute allowedRoles={["student", "user"]}>
            <LibraryRequests />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-new-book"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Add />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-book"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ViewBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/view-user"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ViewUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IssueRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/physical-issue"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PhysicalIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/return-book"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ReturnBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fines"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageFines />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<Notfound />} />
    </Routes>
  );
}

export default App;
