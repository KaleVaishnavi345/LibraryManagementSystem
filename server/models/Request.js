import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Alias for compatibility
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" }, // Alias for compatibility
  requestDate: { type: Date, default: Date.now },
  requestStatus: {
    type: String,
    default: "PENDING"
  },
  issueDate: { type: Date },
  dueDate: { type: Date },
  returnRequestDate: { type: Date },
  returnDate: { type: Date },
  status: {
    type: String,
    default: "PENDING"
  },
  fineAmount: { type: Number, default: 0 },
  fineStatus: { type: String, enum: ["None", "Unpaid", "Paid"], default: "None" },
  finePaidDate: { type: Date },
  adminVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  completeAt: { type: Date }
});

export default mongoose.model("Transaction", transactionSchema, "transactions");

