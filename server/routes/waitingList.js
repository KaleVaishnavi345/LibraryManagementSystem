import express from "express";
import {
  joinWaitlist,
  getStudentWaitlist,
  leaveWaitlist,
  seedSampleWaitlist
} from "../controllers/waitingList.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.post("/join", authenticate, joinWaitlist); // Join waitlist for unavailable book
router.get("/my-waitlist", authenticate, getStudentWaitlist); // Get student's waitlist entries
router.delete("/leave/:id", authenticate, leaveWaitlist); // Leave waitlist
router.post("/seed", authenticate, seedSampleWaitlist); // Test helper to seed waitlist entries

export default router;
