import WaitingList from "../models/WaitingList.js";
import Book from "../models/Book.js";

// Helper function to recalculate & shift queue positions and estimated availability dates for a book
export const recalculateBookQueue = async (bookId) => {
  try {
    const activeEntries = await WaitingList.find({
      bookId,
      status: "WAITING"
    }).sort({ joinedDate: 1 });

    const now = new Date();
    for (let i = 0; i < activeEntries.length; i++) {
      const entry = activeEntries[i];
      const newPos = i + 1;
      const estimatedDays = newPos * 14; // 14-day loan period per queue slot
      const estDate = new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);

      entry.queuePosition = newPos;
      entry.estimatedAvailableDate = estDate;
      entry.updatedAt = now;
      await entry.save();
    }
  } catch (err) {
    console.error("Error recalculating book queue:", err.message);
  }
};

// Join waiting list for an unavailable book
export const joinWaitlist = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user is already in waitlist for this book
    const existingWait = await WaitingList.findOne({
      bookId,
      userId,
      status: "WAITING"
    });

    if (existingWait) {
      return res.status(400).json({
        message: `You are already on the waiting list for this book at Position #${existingWait.queuePosition}.`
      });
    }

    // Calculate sequential queue position & estimated available date
    const waitingCount = await WaitingList.countDocuments({
      bookId,
      status: "WAITING"
    });
    const queuePosition = waitingCount + 1;
    const estimatedDays = queuePosition * 14;
    const estimatedAvailableDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

    const newWaitlistEntry = new WaitingList({
      bookId,
      userId,
      queuePosition,
      joinedDate: new Date(),
      status: "WAITING",
      estimatedAvailableDate
    });

    await newWaitlistEntry.save();

    res.status(201).json({
      message: `Successfully joined waiting list for '${book.title}' at Queue Position #${queuePosition}!`,
      entry: newWaitlistEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's active waitlist entries with queue positions & estimated availability
export const getStudentWaitlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const entries = await WaitingList.find({
      userId,
      status: { $in: ["WAITING", "NOTIFIED"] }
    })
      .populate("bookId")
      .sort({ joinedDate: -1 });

    // Recalculate dynamic position in queue for each entry
    const formattedEntries = await Promise.all(
      entries.map(async (entry) => {
        const bookObj = entry.bookId;
        if (!bookObj) return null;

        const aheadCount = await WaitingList.countDocuments({
          bookId: bookObj._id,
          status: "WAITING",
          joinedDate: { $lt: entry.joinedDate }
        });
        const currentPos = entry.status === "NOTIFIED" ? 0 : aheadCount + 1;
        const estDays = currentPos * 14;
        const estDate = entry.estimatedAvailableDate || new Date(Date.now() + estDays * 24 * 60 * 60 * 1000);

        return {
          _id: entry._id,
          joinedDate: entry.joinedDate,
          queuePosition: currentPos === 0 ? "Next in Line (Notified)" : currentPos,
          estimatedAvailableDate: estDate,
          status: entry.status,
          book: {
            _id: bookObj._id,
            title: bookObj.title,
            author: bookObj.author,
            bookId: bookObj.bookId || "B001",
            category: bookObj.category,
            availableCopies: bookObj.availableCopies ?? 0
          }
        };
      })
    );

    res.status(200).json(formattedEntries.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave/cancel waitlist entry & shift queue positions for remaining students
export const leaveWaitlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const entry = await WaitingList.findOne({ _id: id, userId });
    if (!entry) {
      return res.status(404).json({ message: "Waitlist entry not found" });
    }

    const bookId = entry.bookId;
    entry.status = "CANCELLED";
    await entry.save();

    // Re-index remaining queue positions and shift estimated dates for other waiting students
    await recalculateBookQueue(bookId);

    res.status(200).json({ message: "Successfully left the waiting list. Queue positions updated.", entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Seed sample test waitlist entries for Phase 10
export const seedSampleWaitlist = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find books with 0 available copies or any books
    const unavailableBooks = await Book.find({ availableCopies: 0 });
    const book1 = unavailableBooks[0] || (await Book.findOne());
    const book2 = unavailableBooks[1] || (await Book.find())[1];

    if (!book1) {
      return res.status(404).json({ message: "No books found to add to waitlist" });
    }

    const sampleWaitlist = [
      {
        bookId: book1._id,
        userId,
        queuePosition: 1,
        joinedDate: new Date(Date.now() - 86400000), // 1 day ago
        status: "WAITING"
      }
    ];

    if (book2) {
      sampleWaitlist.push({
        bookId: book2._id,
        userId,
        queuePosition: 2,
        joinedDate: new Date(Date.now() - 43200000), // 12 hours ago
        status: "WAITING"
      });
    }

    await WaitingList.insertMany(sampleWaitlist);
    res.status(201).json({ message: "Sample waitlist entries created successfully for testing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
