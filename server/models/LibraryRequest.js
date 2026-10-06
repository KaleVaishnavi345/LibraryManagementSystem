import mongoose from "mongoose";

const libraryRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestType: {
    type: String,
    enum: ["NEW_BOOK_SUGGESTION", "COMPLAINT", "INQUIRY"],
    default: "NEW_BOOK_SUGGESTION"
  },
  title: { type: String, required: true },
  author: { type: String, default: "" },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"],
    default: "PENDING"
  },
  adminResponse: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("LibraryRequest", libraryRequestSchema, "library_requests");
