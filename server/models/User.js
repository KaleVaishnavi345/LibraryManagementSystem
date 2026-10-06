import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: false }, // Optional for admin, required for student
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  phone: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date },
});

export default mongoose.model("User", userSchema);

