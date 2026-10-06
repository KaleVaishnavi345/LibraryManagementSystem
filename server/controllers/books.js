import Book from "../models/Book.js";
import Request from "../models/Request.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import WaitingList from "../models/WaitingList.js";
import { recalculateBookQueue } from "./waitingList.js";
import multer from "multer";
import path from "path";

//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Add new book controller (Admin)
export const addBook = async (req, res) => {
  const {
    bookId,
    title,
    author,
    category,
    isbn,
    publisher,
    year,
    totalCopies,
    availableCopies,
    description,
    syllabusRelated,
    quantity
  } = req.body || {};

  const imgPath = req.file ? req.file.path : (req.body?.img || "uploads/default.jpg");

  try {
    if (!title || !author || !category) {
      return res.status(400).json({ message: "Title, Author, and Category are required" });
    }

    const newTotal = Number(totalCopies || quantity || 1);
    const newAvailable = availableCopies !== undefined && availableCopies !== "" ? Number(availableCopies) : newTotal;
    const generatedBookId = bookId && bookId.trim() !== "" ? bookId.trim() : `B${String(Date.now()).slice(-4)}`;

    const newBook = new Book({
      bookId: generatedBookId,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn ? isbn.trim() : "",
      publisher: publisher ? publisher.trim() : "",
      year: year ? Number(year) : undefined,
      totalCopies: newTotal,
      availableCopies: newAvailable,
      description: description ? description.trim() : "",
      syllabusRelated: Boolean(syllabusRelated),
      img: imgPath,
      quantity: newTotal,
      borrowed: Math.max(0, newTotal - newAvailable)
    });

    await newBook.save();
    res.status(201).json({ message: "success", book: newBook });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to add book" });
  }
};

// Update existing book controller (Admin)
export const updateBook = async (req, res) => {
  const { id } = req.params;
  const {
    bookId,
    title,
    author,
    category,
    isbn,
    publisher,
    year,
    totalCopies,
    availableCopies,
    description,
    syllabusRelated
  } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (bookId && bookId.trim()) book.bookId = bookId.trim();
    if (title && title.trim()) book.title = title.trim();
    if (author && author.trim()) book.author = author.trim();
    if (category && category.trim()) book.category = category.trim();
    if (isbn !== undefined) book.isbn = String(isbn).trim();
    if (publisher !== undefined) book.publisher = String(publisher).trim();
    if (year !== undefined && year !== "") book.year = Number(year);
    if (totalCopies !== undefined && totalCopies !== "") book.totalCopies = Number(totalCopies);
    if (availableCopies !== undefined && availableCopies !== "") book.availableCopies = Number(availableCopies);
    if (description !== undefined) book.description = String(description).trim();
    if (syllabusRelated !== undefined) book.syllabusRelated = Boolean(syllabusRelated);
    if (req.file) book.img = req.file.path;

    book.quantity = book.totalCopies;
    book.borrowed = Math.max(0, book.totalCopies - book.availableCopies);
    book.updatedAt = new Date();

    await book.save();
    res.status(200).json({ message: "Book updated successfully!", book });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update book" });
  }
};

// Delete book controller (Admin)
export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete book" });
  }
};


// Search Books by keyword (title, author, category, isbn, bookId) and optional category filter
export const searchBooks = async (req, res) => {
  const { query, category } = req.query;

  try {
    let filter = {};

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { isbn: searchRegex },
        { bookId: searchRegex }
      ];
    }

    if (category && category !== "All") {
      filter.category = new RegExp("^" + category + "$", "i");
    }

    const books = await Book.find(filter);

    const booksWithImageURL = books.map((book) => ({
      ...book._doc,
      availableCopies: book.availableCopies ?? Math.max(0, (book.quantity || 1) - (book.borrowed || 0)),
      totalCopies: book.totalCopies ?? (book.quantity || 1),
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/${path.basename(book.img)}`
    }));

    res.status(200).json(booksWithImageURL);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get All Books

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();

    const booksWithImageURL = books.map((book) => ({
      ...book._doc,
      availableCopies: book.availableCopies ?? Math.max(0, (book.quantity || 1) - (book.borrowed || 0)),
      totalCopies: book.totalCopies ?? (book.quantity || 1),
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        book.img
      )}`,
    }));

    res.json(booksWithImageURL);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// fetch Mathematics Books
export const getMathBooks = async (req, res) => {
  try {
    const mathBooks = await Book.find({ category: "Mathematics" });

    // Add the image URL to each book
    const booksWithImageURL = mathBooks.map((book) => ({
      ...book._doc,
      imageUrl: `${req.protocol}://${req.get("host")}/${path.posix.join(
        book.img
      )}`,
    }));

    res.json(booksWithImageURL);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// fetch Eng Books
export const getEngBooks = async (req, res) => {
  try {
    const engBooks = await Book.find({ category: "English" });

    // Add the image URL to each book
    const booksWithImageURL = engBooks.map((book) => ({
      ...book._doc,
      imageUrl: `${req.protocol}://${req.get("host")}/${path.posix.join(
        book.img
      )}`,
    }));

    res.json(booksWithImageURL);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// fetch Comp Books
export const getCompBooks = async (req, res) => {
  try {
    const compBooks = await Book.find({ category: "Computer" });

    // Add the image URL to each book
    const booksWithImageURL = compBooks.map((book) => ({
      ...book._doc,
      imageUrl: `${req.protocol}://${req.get("host")}/${path.posix.join(
        book.img
      )}`,
    }));

    res.json(booksWithImageURL);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//// Add book to cart
export const addToCart = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(400).json({ message: "Book Unavailable" });
    }

    const user = await User.findById(userId);
    if (user.cart.length >= 3) {
      return res.status(400).json({ message: "3 books" });
    }

    if (user.cart.includes(bookId)) {
      return res.status(400).json({ message: "Book already in cart" });
    }

    user.cart.push(bookId);
    await user.save();
    res.json({ message: "Book added to cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get books in cart
export const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).populate("cart");

    res.status(200).json({
      message: "Books in cart",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCartLength = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("cart");

    res.json({ cartLength: user.cart.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Remove book from cart

export const removeFromCart = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    user.cart = user.cart.filter((id) => id.toString() !== bookId);
    await user.save();
    res.json({ message: "Book removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

import Transaction from "../models/Request.js";

// Request a single book directly
export const requestSingleBook = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const isAvailable = (book.availableCopies ?? 1) > 0;
    if (!isAvailable) {
      return res.status(400).json({ message: "Book is currently unavailable. No copies available." });
    }

    // Check if user already has a pending request for this specific book
    const existingTransaction = await Transaction.findOne({
      $and: [
        { $or: [{ userId }, { user: userId }] },
        { $or: [{ bookId }, { book: bookId }] },
        {
          $or: [
            { requestStatus: "PENDING" },
            { status: "PENDING" },
            { requestStatus: "pending" },
            { status: "pending" }
          ]
        }
      ]
    });


    if (existingTransaction) {
      return res.status(400).json({ message: "You already have a pending request for this book." });
    }

    const newTransaction = new Transaction({
      userId,
      bookId,
      user: userId,
      book: bookId,
      requestDate: new Date(),
      requestStatus: "PENDING",
      status: "PENDING",
      fineAmount: 0,
      fineStatus: "None"
    });

    await newTransaction.save();

    res.status(201).json({ message: "Book issue request submitted successfully", transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Request to borrow books in cart
export const requestBooksFromCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("cart");
    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Create an array of book transactions
    const bookRequests = user.cart.map((bookItem) => ({
      userId,
      bookId: bookItem._id,
      user: userId,
      book: bookItem._id,
      requestDate: new Date(),
      requestStatus: "PENDING",
      status: "PENDING",
      fineAmount: 0,
      fineStatus: "None"
    }));

    // Insert new transactions into database
    const requests = await Transaction.insertMany(bookRequests);

    // Clear the user's cart
    user.cart = [];
    await user.save();

    res.status(201).json({ message: "Request submitted", requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's own requests (Student View)
export const getUserRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await Transaction.find({
      $or: [{ userId }, { user: userId }]
    })
      .populate("bookId")
      .populate("book")
      .sort({ requestDate: -1 });

    const formattedRequests = requests.map((reqDoc) => {
      const bookObj = reqDoc.bookId || reqDoc.book;
      return {
        _id: reqDoc._id,
        requestDate: reqDoc.requestDate,
        requestStatus: reqDoc.requestStatus || reqDoc.status || "PENDING",
        status: reqDoc.status || "PENDING",
        book: bookObj
          ? {
              _id: bookObj._id,
              title: bookObj.title,
              author: bookObj.author,
              bookId: bookObj.bookId || "B001",
              category: bookObj.category,
              imageUrl: bookObj.img
                ? `${req.protocol}://${req.get("host")}/uploads/${path.basename(bookObj.img)}`
                : ""
            }
          : null
      };
    });

    res.json(formattedRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's issued books (Student View)
export const getUserIssuedBooks = async (req, res) => {

  const userId = req.user.id;

  try {
    const issuedTransactions = await Transaction.find({
      $or: [{ userId }, { user: userId }],
      status: { $in: ["ISSUED", "RETURN_REQUESTED", "issued", "return_requested"] }
    })
      .populate("bookId")
      .populate("book")
      .sort({ issueDate: -1 });

    const formattedIssued = issuedTransactions.map((tx) => {
      const bookObj = tx.bookId || tx.book;
      // Calculate overdue fine if past due date
      let currentFine = tx.fineAmount || 0;
      if (tx.dueDate && new Date() > new Date(tx.dueDate)) {
        const diffDays = Math.ceil((new Date() - new Date(tx.dueDate)) / (1000 * 60 * 60 * 24));
        currentFine = diffDays * 10; // ₹10 per overdue day
      }

      return {
        _id: tx._id,
        issueDate: tx.issueDate || tx.requestDate,
        dueDate: tx.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
        returnRequestDate: tx.returnRequestDate,
        status: tx.status || "ISSUED",
        fineAmount: currentFine,
        fineStatus: currentFine > 0 ? (tx.fineStatus === "Paid" ? "Paid" : "Unpaid") : "None",
        book: bookObj
          ? {
              _id: bookObj._id,
              title: bookObj.title,
              author: bookObj.author,
              bookId: bookObj.bookId || "B001",
              category: bookObj.category
            }
          : null
      };
    });

    res.json(formattedIssued);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student initiates return request for an issued book
export const requestBookReturn = async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      $or: [{ userId }, { user: userId }]
    });

    if (!transaction) {
      return res.status(404).json({ message: "Issued book record not found" });
    }

    if (transaction.status === "RETURN_REQUESTED" || transaction.status === "return_requested") {
      return res.status(400).json({ message: "Return request has already been submitted for this book" });
    }

    transaction.status = "RETURN_REQUESTED";
    transaction.returnRequestDate = new Date();
    await transaction.save();

    res.json({ message: "Return request submitted successfully. Awaiting admin approval.", transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Seed sample issued book (On Time) for testing
export const seedSampleIssuedBook = async (req, res) => {
  const userId = req.user.id;
  try {
    const sampleBook = await Book.findOne();
    if (!sampleBook) {
      return res.status(404).json({ message: "No books found to issue" });
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 14); // 14 days due date

    const newIssuedTx = new Transaction({
      userId,
      bookId: sampleBook._id,
      user: userId,
      book: sampleBook._id,
      requestDate: new Date(),
      issueDate,
      dueDate,
      requestStatus: "APPROVED",
      status: "ISSUED",
      fineAmount: 0,
      fineStatus: "None"
    });

    await newIssuedTx.save();
    res.status(201).json({ message: "Sample issued book created successfully for testing", transaction: newIssuedTx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Seed sample overdue book for testing Phase 7 (Fine View)
export const seedSampleOverdueBook = async (req, res) => {

  const userId = req.user.id;
  try {
    const sampleBook = await Book.findOne({ title: { $regex: "Operating|Clean|Algorithms", $options: "i" } }) || await Book.findOne();
    if (!sampleBook) {
      return res.status(404).json({ message: "No books found to issue" });
    }

    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - 20); // Issued 20 days ago

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - 5); // Due date was 5 days ago (Overdue!)

    const overdueDays = 5;
    const fineAmount = overdueDays * 10; // ₹50 fine

    const newOverdueTx = new Transaction({
      userId,
      bookId: sampleBook._id,
      user: userId,
      book: sampleBook._id,
      requestDate: issueDate,
      issueDate,
      dueDate,
      requestStatus: "APPROVED",
      status: "ISSUED",
      fineAmount: fineAmount,
      fineStatus: "Unpaid"
    });

    await newOverdueTx.save();
    res.status(201).json({ message: "Sample overdue book created successfully for testing", transaction: newOverdueTx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's fine summary and due-date breakdown (Student View)
export const getStudentFineSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await Transaction.find({
      $or: [{ userId }, { user: userId }],
      status: { $in: ["ISSUED", "RETURN_REQUESTED", "issued", "return_requested"] }
    })
      .populate("bookId")
      .populate("book");

    let totalUnpaidFine = 0;
    const fineDetails = transactions.map((tx) => {
      const bookObj = tx.bookId || tx.book;
      const now = new Date();
      const due = tx.dueDate ? new Date(tx.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      
      let isOverdue = false;
      let daysOverdue = 0;
      let daysRemaining = 0;
      let calculatedFine = tx.fineAmount || 0;

      if (now > due) {
        isOverdue = true;
        daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
        calculatedFine = daysOverdue * 10; // ₹10 per overdue day
        if (tx.fineStatus !== "Paid") {
          totalUnpaidFine += calculatedFine;
        }
      } else {
        daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      }

      return {
        transactionId: tx._id,
        bookTitle: bookObj ? bookObj.title : "Unknown Title",
        bookId: bookObj ? (bookObj.bookId || "B001") : "B001",
        issueDate: tx.issueDate || tx.requestDate,
        dueDate: due,
        isOverdue,
        daysOverdue,
        daysRemaining,
        fineAmount: calculatedFine,
        fineStatus: calculatedFine > 0 ? (tx.fineStatus === "Paid" ? "Paid" : "Unpaid") : "None"
      };
    });

    res.json({
      totalUnpaidFine,
      totalIssuedCount: transactions.length,
      overdueCount: fineDetails.filter(f => f.isOverdue).length,
      fineDetails
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get all requests (Admin View)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Transaction.find()
      .populate("userId")
      .populate("user")
      .populate("bookId")
      .populate("book")
      .sort({ requestDate: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin approves a student book issue request
export const approveRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await Request.findById(requestId)
      .populate("bookId")
      .populate("book")
      .populate("userId")
      .populate("user");

    if (!request) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    request.requestStatus = "APPROVED";
    if (req.user) {
      request.adminVerifiedBy = req.user.id;
    }
    request.updatedAt = new Date();

    await request.save();

    // Create automated student notification
    const studentUser = request.userId || request.user;
    const studentId = studentUser ? (studentUser._id || studentUser) : null;
    const bookObj = request.bookId || request.book;
    const bookTitle = bookObj ? bookObj.title : "Requested Book";

    if (studentId) {
      await Notification.create({
        userId: studentId,
        title: "📚 Book Issue Request Approved",
        message: `Your issue request for '${bookTitle}' has been APPROVED by the librarian! Please collect your physical copy from the library counter.`,
        type: "REQUEST_STATUS"
      });
    }

    res.status(200).json({ message: "Issue request approved successfully!", request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin rejects a student book issue request
export const rejectRequest = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body || {};

  try {
    const request = await Request.findById(requestId)
      .populate("bookId")
      .populate("book")
      .populate("userId")
      .populate("user");

    if (!request) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    request.requestStatus = "REJECTED";
    request.status = "REJECTED";
    if (req.user) {
      request.adminVerifiedBy = req.user.id;
    }
    request.updatedAt = new Date();

    await request.save();

    // Create automated student notification
    const studentUser = request.userId || request.user;
    const studentId = studentUser ? (studentUser._id || studentUser) : null;
    const bookObj = request.bookId || request.book;
    const bookTitle = bookObj ? bookObj.title : "Requested Book";

    if (studentId) {
      await Notification.create({
        userId: studentId,
        title: "❌ Book Issue Request Rejected",
        message: `Your issue request for '${bookTitle}' was REJECTED by the librarian.${reason ? ` Reason: ${reason}` : ""}`,
        type: "REQUEST_STATUS"
      });
    }

    res.status(200).json({ message: "Issue request rejected", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin issues physical book at counter & assigns 14-day due date
export const issuePhysicalBook = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Request.findById(transactionId)
      .populate("bookId")
      .populate("book")
      .populate("userId")
      .populate("user");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction record not found" });
    }

    const bookObj = transaction.bookId || transaction.book;
    if (!bookObj) {
      return res.status(404).json({ message: "Associated book record not found" });
    }

    if (bookObj.availableCopies !== undefined && bookObj.availableCopies <= 0) {
      return res.status(400).json({ message: "Cannot issue book: 0 copies available on shelf!" });
    }

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    transaction.issueDate = now;
    transaction.dueDate = dueDate;
    transaction.status = "ISSUED";
    transaction.requestStatus = "APPROVED";
    if (req.user) {
      transaction.adminVerifiedBy = req.user.id;
    }
    transaction.updatedAt = now;

    // Decrement available copies on shelf
    if (bookObj.availableCopies !== undefined && bookObj.availableCopies > 0) {
      bookObj.availableCopies -= 1;
      bookObj.borrowed = (bookObj.borrowed || 0) + 1;
      await bookObj.save();
    }

    await transaction.save();

    // Create automated student notification
    const studentUser = transaction.userId || transaction.user;
    const studentId = studentUser ? (studentUser._id || studentUser) : null;
    const bookTitle = bookObj.title || "Library Book";

    if (studentId) {
      await Notification.create({
        userId: studentId,
        title: "📖 Physical Book Issued",
        message: `Your physical copy of '${bookTitle}' has been issued at the library counter! Return Due Date: ${dueDate.toLocaleDateString()}. Please return on time to avoid overdue fines.`,
        type: "DUE_ALERT"
      });
    }

    res.status(200).json({
      message: `Physical book '${bookTitle}' issued successfully! Due date set to ${dueDate.toLocaleDateString()}`,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to issue physical book" });
  }
};

// Admin approves & confirms book return at counter (Phase 15)
export const processBookReturn = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Request.findById(transactionId)
      .populate("bookId")
      .populate("book")
      .populate("userId")
      .populate("user");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction record not found" });
    }

    if (transaction.status === "RETURNED" || transaction.status === "returned") {
      return res.status(400).json({ message: "Book has already been returned" });
    }

    const returnDate = new Date();
    const dueDate = transaction.dueDate ? new Date(transaction.dueDate) : new Date();

    let overdueDays = 0;
    let fineAmount = 0;
    let fineStatus = "None";

    if (returnDate > dueDate) {
      overdueDays = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * 10; // ₹10 fine per overdue day
      fineStatus = "Unpaid";
    }

    transaction.returnDate = returnDate;
    transaction.status = "RETURNED";
    transaction.fineAmount = fineAmount;
    transaction.fineStatus = fineStatus;
    if (req.user) {
      transaction.adminVerifiedBy = req.user.id;
    }
    transaction.updatedAt = returnDate;

    // Restore book shelf inventory & execute FIFO Waitlist Auto-Chaining
    const bookObj = transaction.bookId || transaction.book;
    if (bookObj) {
      bookObj.availableCopies = (bookObj.availableCopies ?? 0) + 1;
      bookObj.borrowed = Math.max(0, (bookObj.borrowed || 1) - 1);
      await bookObj.save();

      // FIFO Waiting List Auto-Assignment Check
      try {
        const topWaitingEntry = await WaitingList.findOne({
          bookId: bookObj._id,
          status: "WAITING"
        }).sort({ joinedDate: 1 }).populate("userId");

        if (topWaitingEntry && topWaitingEntry.userId) {
          topWaitingEntry.status = "NOTIFIED";
          topWaitingEntry.notifiedAt = new Date();
          await topWaitingEntry.save();

          const waitingStudent = topWaitingEntry.userId;

          // Save In-App Notification for Waiting Student
          await Notification.create({
            userId: waitingStudent._id,
            title: "📚 Reserved Book Now Available!",
            message: `Great news! '${bookObj.title}' is now available in the library. Please submit your issue request to claim it.`,
            type: "WAITLIST_ALERT"
          });

          // Print Server Console Output
          console.log(`
==================================================
LIBRARY SYSTEM - WAITING LIST AUTO-ASSIGNMENT
==================================================
Book: ${bookObj.title}
Assigned Student: ${waitingStudent.name} (${waitingStudent.email})
Queue Position: #1
Status: Student notified of availability
==================================================
`);

          // Recalculate & shift queue positions for remaining waiting students
          await recalculateBookQueue(bookObj._id);
        }
      } catch (waitErr) {
        console.error("Error during waitlist FIFO auto-chaining:", waitErr.message);
      }
    }

    await transaction.save();

    // Create automated student notification
    const studentUser = transaction.userId || transaction.user;
    const studentId = studentUser ? (studentUser._id || studentUser) : null;
    const bookTitle = bookObj ? bookObj.title : "Library Book";

    if (studentId) {
      if (overdueDays > 0) {
        await Notification.create({
          userId: studentId,
          title: "⚠️ Book Returned - Overdue Fine Assessed",
          message: `Your book '${bookTitle}' was returned ${overdueDays} days late. An overdue fine of ₹${fineAmount} has been registered to your account.`,
          type: "FINE_ALERT"
        });
      } else {
        await Notification.create({
          userId: studentId,
          title: "✅ Book Returned Successfully",
          message: `Your physical copy of '${bookTitle}' has been successfully returned to the library on time! Thank you.`,
          type: "REQUEST_STATUS"
        });
      }
    }

    res.status(200).json({
      message: overdueDays > 0
        ? `Book returned! Overdue fine of ₹${fineAmount} (${overdueDays} days late) registered.`
        : `Book '${bookTitle}' returned on time! Inventory updated.`,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to process book return" });
  }
};

// Admin verifies & settles student fine payment (Phase 16)
export const settleFinePayment = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Request.findById(transactionId)
      .populate("bookId")
      .populate("book")
      .populate("userId")
      .populate("user");

    if (!transaction) {
      return res.status(404).json({ message: "Fine transaction record not found" });
    }

    if (transaction.fineStatus === "Paid") {
      return res.status(400).json({ message: "Fine for this transaction is already settled!" });
    }

    const fineAmount = transaction.fineAmount || 0;
    if (fineAmount <= 0) {
      return res.status(400).json({ message: "No fine due on this transaction." });
    }

    const now = new Date();
    transaction.fineStatus = "Paid";
    transaction.finePaidDate = now;
    if (req.user) {
      transaction.adminVerifiedBy = req.user.id;
    }
    transaction.updatedAt = now;

    await transaction.save();

    // Create automated student notification receipt
    const studentUser = transaction.userId || transaction.user;
    const studentId = studentUser ? (studentUser._id || studentUser) : null;
    const bookObj = transaction.bookId || transaction.book;
    const bookTitle = bookObj ? bookObj.title : "Library Book";
    const receiptNo = `F-PAID-${transaction._id.toString().slice(-6).toUpperCase()}`;

    if (studentId) {
      await Notification.create({
        userId: studentId,
        title: "💳 Overdue Fine Settled & Paid",
        message: `Your overdue fine payment of ₹${fineAmount} for '${bookTitle}' has been verified & settled by the librarian! Receipt No: ${receiptNo}.`,
        type: "FINE_ALERT"
      });
    }

    res.status(200).json({
      message: `Fine payment of ₹${fineAmount} for '${bookTitle}' successfully settled! Receipt No: ${receiptNo}`,
      transaction,
      receiptNo
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to settle fine payment" });
  }
};




