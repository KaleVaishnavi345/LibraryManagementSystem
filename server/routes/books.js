import express from "express";
import {
  addBook,
  updateBook,
  getBooks,
  searchBooks,
  deleteBook,
  approveRequest,
  rejectRequest,
  issuePhysicalBook,
  processBookReturn,
  settleFinePayment,
  getAllRequests,
  getUserRequests,
  requestSingleBook,
  getUserIssuedBooks,
  requestBookReturn,
  seedSampleIssuedBook,
  seedSampleOverdueBook,
  getStudentFineSummary,
  addToCart,
  removeFromCart,
  requestBooksFromCart,
  getMathBooks,
  getEngBooks,
  getCompBooks,
  getCart,
  getCartLength
} from "../controllers/books.js";
import authenticate from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Book catalog routes
router.post("/add", upload.single("img"), addBook);
router.put("/update/:id", upload.single("img"), updateBook);
router.get("/", getBooks);
router.get("/search", searchBooks);
router.get("/math", getMathBooks);
router.get("/english", getEngBooks);
router.get("/comp", getCompBooks);

router.delete("/:id", deleteBook);
router.get("/requests", getAllRequests); // Admin views all requests
router.put("/requests/approve/:requestId", approveRequest); // Admin approves request
router.put("/requests/reject/:requestId", rejectRequest); // Admin rejects request
router.put("/issue-physical/:transactionId", authenticate, issuePhysicalBook); // Admin issues physical book at counter
router.put("/return-process/:transactionId", authenticate, processBookReturn); // Admin processes physical book return
router.put("/settle-fine/:transactionId", authenticate, settleFinePayment); // Admin verifies & settles fine payment

// Student Book Issue Request routes
router.post("/request-single", authenticate, requestSingleBook); // Student requests a single book
router.get("/my-requests", authenticate, getUserRequests); // Student views their submitted requests

// Student Issued Books & Fine View routes (Phase 6 & Phase 7)
router.get("/my-issued", authenticate, getUserIssuedBooks); // Student views their issued books
router.get("/my-fines", authenticate, getStudentFineSummary); // Student views fine summary & due date breakdown
router.put("/return-request/:transactionId", authenticate, requestBookReturn); // Student requests book return
router.post("/seed-issued", authenticate, seedSampleIssuedBook); // Helper: Seed sample issued book (On-Time)
router.post("/seed-overdue", authenticate, seedSampleOverdueBook); // Helper: Seed sample overdue book (With Fine)

// Cart routes with authentication 
router.get("/cart", authenticate, getCart); // Student views their cart
router.get("/cart/length", authenticate, getCartLength); // Student views number of items in cart
router.post("/cart/add", authenticate, addToCart); // Student adds book to cart
router.delete("/cart/:bookId", authenticate, removeFromCart); // Student removes book from cart
router.post("/cart/request", authenticate, requestBooksFromCart); // Student requests all books in cart

export default router;



