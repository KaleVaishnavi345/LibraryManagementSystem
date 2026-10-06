import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Standard Email Format Validation Regex
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(email).trim().toLowerCase());
};

// Student Registration Controller with OTP Verification
export const Register = async (req, res) => {
  const { studentId, name, email, password, phone, department } = req.body;

  try {
    // 1. Basic required fields validation
    if (!name || !email || !password || !studentId) {
      return res.status(400).json({ message: "Student ID, Name, Email, and Password are required" });
    }

    // 2. Strict Email Format Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address (e.g. student@gmail.com)" });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: "Student with this Email or Student ID already exists" });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Generate 6-digit OTP code (10 min expiry)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 6. Create user with isVerified = false
    const newUser = new User({
      studentId,
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "student",
      phone: phone || "",
      department: department || "",
      isVerified: false,
      otp: otpCode,
      otpExpiresAt,
    });

    await newUser.save();

    // 7. Output formatted OTP to SERVER CONSOLE
    console.log(`
==================================================
LIBRARY SYSTEM - STUDENT OTP
==================================================
Student Name: ${name}
Student Email: ${newUser.email}
OTP: ${otpCode}
Valid For: 10 minutes
Status: OTP generated successfully
==================================================
`);

    // 8. Return response without exposing OTP in API
    res.status(201).json({
      message: "OTP generated successfully. Please verify your account.",
      email: newUser.email,
      requiresOtp: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// Verify Registration OTP Controller
export const VerifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Student account not found with this email" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Account is already verified. You can log in!" });
    }

    if (!user.otp || user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: "Invalid OTP verification code. Please check and try again." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: "OTP code has expired. Please register again or request a new OTP." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now log in to your account.",
      verified: true
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during OTP verification", error: error.message });
  }
};

// Login Controller (For both Student and Admin)
export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    // 2. Strict Email Format Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // 3. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // 4. Check account active status
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is suspended. Contact Administrator." });
    }

    // 5. Check account email verification status
    if (user.role === "student" && user.isVerified === false) {
      return res.status(400).json({ message: "Please verify your email address using OTP before logging in." });
    }

    // 6. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // 7. Generate JWT using process.env.JWT_SECRET
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 8. Return safe user info + token
    res.status(200).json({
      message: "success",
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// Seed Default Admin & Student Account helper
export const seedDefaultAdminUser = async (req, res) => {
  try {
    let adminUser = await User.findOne({ email: "admin@library.com" });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser = new User({
        studentId: "ADM001",
        name: "Head Librarian Admin",
        email: "admin@library.com",
        password: hashedPassword,
        role: "admin",
        phone: "9876543210",
        department: "Library Administration",
        isActive: true,
        isVerified: true
      });
      await adminUser.save();
      console.log("Admin account (admin@library.com / admin123) created successfully in MongoDB!");
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser.role = "admin";
      adminUser.password = hashedPassword;
      adminUser.isActive = true;
      adminUser.isVerified = true;
      await adminUser.save();
      console.log("Admin account (admin@library.com / admin123) verified & updated in MongoDB!");
    }

    // Ensure default student demo user exists
    let studentUser = await User.findOne({ email: "vaishnavi123@gmail.com" });
    const studentHashedPassword = await bcrypt.hash("password123", 10);
    if (!studentUser) {
      studentUser = new User({
        studentId: "S101",
        name: "Deshmukh Vaishnavi",
        email: "vaishnavi123@gmail.com",
        password: studentHashedPassword,
        role: "student",
        phone: "9876543211",
        department: "Computer Science",
        isActive: true,
        isVerified: true
      });
      await studentUser.save();
      console.log("Student demo account (vaishnavi123@gmail.com / password123) created successfully!");
    } else {
      studentUser.password = studentHashedPassword;
      studentUser.isActive = true;
      studentUser.isVerified = true;
      await studentUser.save();
      console.log("Student demo account (vaishnavi123@gmail.com / password123) verified & updated!");
    }

    if (res) {
      return res.status(200).json({
        message: "Demo credentials ready!",
        admin: { email: "admin@library.com", password: "admin123" },
        student: { email: "vaishnavi123@gmail.com", password: "password123" },
      });
    }
  } catch (error) {
    console.error("Error in seedDefaultAdminUser:", error);
    if (res) return res.status(500).json({ error: error.message });
  }
};





