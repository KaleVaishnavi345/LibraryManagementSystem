import mongoose from "mongoose";

const waitingListSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  queuePosition: { type: Number, required: true },
  joinedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["WAITING", "NOTIFIED", "EXPIRED", "CANCELLED"],
    default: "WAITING"
  },
  notifiedAt: { type: Date },
  expiresAt: { type: Date },
  estimatedAvailableDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("WaitingList", waitingListSchema, "waiting_lists");
