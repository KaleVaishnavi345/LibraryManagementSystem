import express from "express";
import { getAdminDashboardStats, getAllStudents, toggleUserStatus, sendCustomNotification } from "../controllers/admin.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Admin Dashboard overview stats (Protected: Admin only)
router.get("/dashboard-stats", authenticate, authorizeRoles("admin"), getAdminDashboardStats);

// Student Directory & Status Controls (Protected: Admin only)
router.get("/students", authenticate, authorizeRoles("admin"), getAllStudents);
router.put("/toggle-user-status/:id", authenticate, authorizeRoles("admin"), toggleUserStatus);

// Send Email & In-App Notification (Protected: Admin only)
router.post("/send-notification", authenticate, authorizeRoles("admin"), sendCustomNotification);

export default router;

