import Book from "../models/Book.js";
import User from "../models/User.js";
import Transaction from "../models/Request.js";
import LibraryRequest from "../models/LibraryRequest.js";
import Notification from "../models/Notification.js";

// Fetch admin dashboard overview metrics
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalStudents = await User.countDocuments({ role: { $in: ["student", "user"] } });
    const activeIssuedBooks = await Transaction.countDocuments({
      status: { $in: ["ISSUED", "issued"] }
    });
    const pendingIssueRequests = await Transaction.countDocuments({
      requestStatus: { $in: ["PENDING", "pending"] }
    });
    const pendingLibraryRequests = await LibraryRequest.countDocuments({
      status: "PENDING"
    });

    // Calculate total paid fines and total unpaid fines
    const transactions = await Transaction.find();
    let totalFinesCollected = 0;
    let totalUnpaidFines = 0;

    const now = new Date();
    transactions.forEach((tx) => {
      if (tx.fineStatus === "Paid") {
        totalFinesCollected += tx.fineAmount || 0;
      } else if (tx.status === "ISSUED" || tx.status === "issued") {
        if (tx.dueDate && now > new Date(tx.dueDate)) {
          const daysOverdue = Math.ceil((now - new Date(tx.dueDate)) / (1000 * 60 * 60 * 24));
          totalUnpaidFines += daysOverdue * 10;
        }
      }
    });

    res.status(200).json({
      totalBooks,
      totalStudents,
      activeIssuedBooks,
      pendingIssueRequests,
      pendingLibraryRequests,
      totalFinesCollected,
      totalUnpaidFines
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all registered students directory with activity metrics
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: { $in: ["student", "user"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const transactions = await Transaction.find();

    const studentDirectory = students.map((student) => {
      const studentIdStr = student._id.toString();

      // Calculate student's active issued books count
      const activeIssuedCount = transactions.filter(
        (tx) =>
          (tx.userId?.toString() === studentIdStr || tx.user?.toString() === studentIdStr) &&
          (tx.status === "ISSUED" || tx.status === "issued" || tx.status === "RETURN_REQUESTED")
      ).length;

      // Calculate student's unpaid fines
      let unpaidFineSum = 0;
      const now = new Date();
      transactions.forEach((tx) => {
        const isMatch = tx.userId?.toString() === studentIdStr || tx.user?.toString() === studentIdStr;
        if (isMatch) {
          if (tx.fineStatus === "Unpaid" && tx.fineAmount > 0) {
            unpaidFineSum += tx.fineAmount;
          } else if ((tx.status === "ISSUED" || tx.status === "issued") && tx.dueDate && now > new Date(tx.dueDate)) {
            const daysOverdue = Math.ceil((now - new Date(tx.dueDate)) / (1000 * 60 * 60 * 24));
            unpaidFineSum += daysOverdue * 10;
          }
        }
      });

      return {
        ...student._doc,
        activeIssuedCount,
        unpaidFineSum
      };
    });

    res.status(200).json(studentDirectory);
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch student directory" });
  }
};

// Toggle student account status (Active <-> Suspended)
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.status(200).json({
      message: `Account status for ${user.name} updated to ${user.isActive ? 'ACTIVE' : 'SUSPENDED/DEACTIVATED'}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update user account status" });
  }
};

// Send In-App Notification from Admin to Student(s) with Server Console Logging
export const sendCustomNotification = async (req, res) => {
  const { studentId, title, message } = req.body;

  try {
    if (!title || !message) {
      return res.status(400).json({ message: "Notification Title and Message body are required" });
    }

    let targetStudents = [];
    const isBroadcast = studentId === "all" || !studentId;

    if (isBroadcast) {
      targetStudents = await User.find({ role: { $in: ["student", "user"] }, isActive: true });
    } else {
      const singleStudent = await User.findById(studentId);
      if (singleStudent) targetStudents.push(singleStudent);
    }

    if (targetStudents.length === 0) {
      return res.status(404).json({ message: "No active student accounts found to notify" });
    }

    for (const student of targetStudents) {
      // Save In-App Notification (Visible on Student Dashboard UI)
      await Notification.create({
        userId: student._id,
        title,
        message,
        type: "SYSTEM",
      });
    }

    // Print Server Console Output
    if (isBroadcast) {
      const studentListOutput = targetStudents
        .map((s, idx) => `${idx + 1}. ${s.name} - ${s.email}`)
        .join("\n");

      console.log(`
==================================================
LIBRARY SYSTEM - BROADCAST
==================================================
Title: ${title}
Message: ${message}

Notification stored for:
${studentListOutput}

Total students notified: ${targetStudents.length}
Status: Broadcast completed
Delivery: In-App / Database
==================================================
`);
    } else {
      const targetStudent = targetStudents[0];
      console.log(`
==================================================
LIBRARY SYSTEM - NOTIFICATION SENT
==================================================
Student: ${targetStudent.name}
Student ID: ${targetStudent.studentId || "N/A"}
Email: ${targetStudent.email}

Title: ${title}

Message:
${message}

Status: Notification sent to student account
Delivery: In-App / Database
==================================================
`);
    }

    res.status(200).json({
      message: `Notification successfully created for ${targetStudents.length} student account(s)!`,
      recipientCount: targetStudents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create notification" });
  }
};



