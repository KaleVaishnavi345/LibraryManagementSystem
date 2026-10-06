import express from "express";
import {
  getStudentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  seedSampleNotifications
} from "../controllers/notifications.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getStudentNotifications); // Get student's notifications & unread count
router.put("/read/:id", authenticate, markNotificationAsRead); // Mark single notification as read
router.put("/read-all", authenticate, markAllNotificationsAsRead); // Mark all notifications as read
router.post("/seed", authenticate, seedSampleNotifications); // Test helper to seed sample notifications

export default router;
