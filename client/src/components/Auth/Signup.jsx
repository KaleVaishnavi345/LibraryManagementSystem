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

function Signup() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const validate = () => {
    const errs = {};
    const emailRegex = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

    if (!studentId.trim()) errs.studentId = "Student ID is required";
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(email.trim().toLowerCase())) {
      errs.email = "Please enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        studentId: studentId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        department: department.trim(),
      });

      if (response.status === 201) {
        toast.info(response.data.message || "OTP generated successfully. Please verify your account.");
        setIsOtpStep(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed. Please check your info and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otpCode.trim(),
      });

      if (response.status === 200) {
        toast.success(response.data.message || "Email verified! Redirecting to login...");
        setTimeout(() => {
          navigate("/");
        }, 1200);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "OTP Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
          value="student"
          onChange={(newRole) => {
            if (newRole === "admin") navigate("/");
          }}
          options={[
            { value: "student", label: "Student", icon: "🎓" },
            { value: "admin", label: "Admin", icon: "👤" },
          ]}
        />
      </div>

      {/* Underlined Tabs */}
      <Tabs
        activeTab="register"
        onChange={(tab) => {
          if (tab === "signin") navigate("/");
        }}
        tabs={[
          { value: "signin", label: "Sign In" },
          { value: "register", label: "Register" },
        ]}
      />

      {!isOtpStep ? (
        <>
          {/* Heading */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--color-primary)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em"
            }}>
              Student Registration
            </h2>
            <p style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
              margin: 0
            }}>
              Create your library account with email OTP verification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Student ID"
                placeholder="e.g. S1024"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errors.studentId) setErrors({ ...errors, studentId: null });
                }}
                error={errors.studentId}
                required
              />

              <Input
                label="Full Name"
                placeholder="e.g. Alex Taylor"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                error={errors.name}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@college.edu"
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Department"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />

              <Input
                label="Phone Contact"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              arrow
              loading={loading}
              style={{ marginTop: "6px", marginBottom: "16px" }}
            >
              Register & Send OTP
            </Button>

            <div style={{ textAlign: "center", fontSize: "13px", color: "var(--color-text-muted)" }}>
              Already registered?{" "}
              <span
                onClick={() => navigate("/")}
                style={{ color: "var(--color-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Sign in here
              </span>
            </div>
          </form>
        </>
      ) : (
        <>
          {/* OTP Verification Form */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--color-primary)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em"
            }}>
              🔑 Verify Email OTP
            </h2>
            <p style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
              margin: 0
            }}>
              We sent a 6-digit OTP code to <strong>{email}</strong>. Enter it below to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <Input
              label="6-Digit OTP Code"
              placeholder="e.g. 123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              maxLength={6}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              style={{ marginTop: "12px", marginBottom: "16px" }}
            >
              Verify OTP & Complete Account
            </Button>

            <div style={{ textAlign: "center", fontSize: "13px", color: "var(--color-text-muted)" }}>
              Wrong email or need to start over?{" "}
              <span
                onClick={() => setIsOtpStep(false)}
                style={{ color: "var(--color-primary)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
              >
                Go back to details
              </span>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
}

export default Signup;

