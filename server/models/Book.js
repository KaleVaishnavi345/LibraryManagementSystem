import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  bookId: { type: String, required: true, default: () => "B" + Math.floor(100 + Math.random() * 900) },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, default: "" },
  category: { type: String, required: true },
  publisher: { type: String, default: "" },
  year: { type: Number },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true, default: 1 },
  description: { type: String, default: "" },
  syllabusRelated: { type: Boolean, default: false },
  img: { type: String, required: true },
  quantity: { type: Number, default: 1 }, // Retained for backward compatibility
  borrowed: { type: Number, default: 0 }, // Retained for backward compatibility
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Book", bookSchema);

