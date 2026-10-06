import express from "express";
import {
  createLibraryRequest,
  getStudentLibraryRequests,
  seedSampleLibraryRequests,
  getAllLibraryRequests,
  updateLibraryRequestStatus
} from "../controllers/libraryRequests.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authenticate, createLibraryRequest); // Student submits new request/complaint
router.get("/my-requests", authenticate, getStudentLibraryRequests); // Student views submitted requests/complaints
router.post("/seed", authenticate, seedSampleLibraryRequests); // Test helper

// Admin routes
router.get("/all", authenticate, authorizeRoles("admin"), getAllLibraryRequests);
router.put("/status/:id", authenticate, authorizeRoles("admin"), updateLibraryRequestStatus);

export default router;
