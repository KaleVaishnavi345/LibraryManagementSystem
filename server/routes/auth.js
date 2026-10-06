import express from "express";
import { Register, Login, VerifyOTP, seedDefaultAdminUser } from "../controllers/auth.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Public Authentication Routes
router.post("/register", Register);
router.post("/verify-otp", VerifyOTP);
router.post("/login", Login);
router.post("/seed-admin", seedDefaultAdminUser);


// Protected Verification Routes
router.get("/me", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get("/protected", authenticate, (req, res) => {
  res.status(200).json({ message: "Authenticated successfully", user: req.user });
});

router.get("/protected-admin", authenticate, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({ message: "Admin access granted", user: req.user });
});

export default router;

