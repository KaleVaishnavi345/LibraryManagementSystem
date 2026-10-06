import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "../Common/Auth/AuthLayout";
import SegmentedControl from "../Common/UI/SegmentedControl";
import Tabs from "../Common/UI/Tabs";
import Input from "../Common/UI/Input";
import Button from "../Common/UI/Button";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student"); // "student" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const emailRegex = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(email.trim().toLowerCase())) {
      errs.email = "Please enter a valid email address (e.g. you@college.edu)";
    }

    if (!password) {
      errs.password = "Password is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.message === "success" || response.data.token) {
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("studentId", response.data.user.studentId || "");
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("department", response.data.user.department || "General");
        localStorage.setItem("phone", response.data.user.phone || "");
        localStorage.setItem("token", response.data.token);

        toast.success("Login Successful!");

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/welcome");
        }
      }
    } catch (error) {
      let errorMessage = "Invalid credentials, please check and try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === "ERR_NETWORK" || !error.response) {
        errorMessage = "Cannot connect to server at http://localhost:8080. Please ensure the backend is running.";
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrors({});
    if (newRole === "admin") {
      setEmail("admin@library.com");
      setPassword("admin123");
    } else {
      setEmail("vaishnavi123@gmail.com");
      setPassword("password123");
    }
  };

  return (
    <AuthLayout>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      {/* Role Pill Switcher */}
      <div style={{ marginBottom: "20px" }}>
        <SegmentedControl
          value={role}
          onChange={handleRoleChange}
          options={[
            { value: "student", label: "Student", icon: "🎓" },
            { value: "admin", label: "Admin", icon: "👤" },
          ]}
        />
      </div>

      {/* Second-level Underlined Tabs for Student role */}
      {role === "student" && (
        <Tabs
          activeTab="signin"
          onChange={(tab) => {
            if (tab === "register") navigate("/register");
          }}
          tabs={[
            { value: "signin", label: "Sign In" },
            { value: "register", label: "Register" },
          ]}
        />
      )}

      {/* Heading & Subtitle */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--color-primary)",
          margin: "0 0 6px 0",
          letterSpacing: "-0.02em"
        }}>
          {role === "admin" ? "Admin Login" : "Student Login"}
        </h2>
        <p style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          margin: 0
        }}>
          {role === "admin"
            ? "Enter your admin credentials."
            : "Welcome back! Sign in to continue."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder={role === "admin" ? "admin@library.edu" : "you@college.edu"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: null });
          }}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          arrow
          loading={loading}
          style={{ marginTop: "8px", marginBottom: "20px" }}
        >
          Sign In
        </Button>

        {/* Demo Credentials Caption */}
        <div style={{
          textAlign: "center",
          fontSize: "12px",
          color: "var(--color-text-light)",
          fontFamily: "var(--font-mono)",
          lineHeight: 1.5,
          cursor: "pointer"
        }}
        onClick={() => {
          if (role === "admin") {
            setEmail("admin@library.com");
            setPassword("admin123");
            toast.info("Admin demo credentials filled!");
          } else {
            setEmail("vaishnavi123@gmail.com");
            setPassword("password123");
            toast.info("Student demo credentials filled!");
          }
        }}
        title="Click to auto-fill demo credentials"
        >
          {role === "admin" ? (
            <span>Demo: admin@library.com / admin123</span>
          ) : (
            <span>Demo: vaishnavi123@gmail.com / password123</span>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;
