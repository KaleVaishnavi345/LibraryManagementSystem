import Notification from "../models/Notification.js";
import Transaction from "../models/Request.js";

// Get student's notifications & generate automated alerts
export const getStudentNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Generate automated alerts based on active transactions
    const activeTransactions = await Transaction.find({
      $or: [{ userId }, { user: userId }],
      status: { $in: ["ISSUED", "issued"] }
    }).populate("bookId").populate("book");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const tx of activeTransactions) {
      const bookObj = tx.bookId || tx.book;
      const title = bookObj ? bookObj.title : "Issued Book";
      const due = tx.dueDate ? new Date(tx.dueDate) : new Date();
      const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      const diffDays = Math.round((dueStart - todayStart) / (1000 * 60 * 60 * 24));

      // 1. Check for Overdue Fine Alert (now > due)
      if (now > due) {
        const daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * 10;
        // Check if an unread fine alert already exists in last 24h
        const existingAlert = await Notification.findOne({
          userId,
          type: "FINE_ALERT",
          message: { $regex: title, $options: "i" },
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });

        if (!existingAlert) {
          await Notification.create({
            userId,
            title: "⚠️ Overdue Book & Fine Alert",
            message: `Your book "${title}" is overdue by ${daysOverdue} day(s). Current fine: ₹${fineAmount}. Please return it to avoid additional charges.`,
            type: "FINE_ALERT"
          });
        }
      } 
      // 2. Check for 2-Day-Before Due Date Reminder (exactly 2 calendar days away)
      else if (diffDays === 2) {
        const existingReminder = await Notification.findOne({
          userId,
          type: "DUE_ALERT",
          message: { $regex: title, $options: "i" },
          createdAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) }
        });

        if (!existingReminder) {
          const formattedDueDate = due.toLocaleDateString();
          await Notification.create({
            userId,
            title: "⏳ Book Due Reminder",
            message: `Your borrowed book '${title}' is due in 2 days on ${formattedDueDate}. Please return it on time to avoid overdue fines.`,
            type: "DUE_ALERT"
          });
        }
      }
    }

    // 2. Fetch all notifications sorted by latest first
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark single notification as read
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Seed sample test notifications for Phase 8
export const seedSampleNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const sampleAlerts = [
      {
        userId,
        title: "📚 Book Issue Request Approved",
        message: "Your issue request for 'Database System Concepts' (B001) has been approved by the librarian. Please collect your physical copy from the main counter.",
        type: "REQUEST_STATUS",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        userId,
        title: "⏳ Due Date Reminder",
        message: "Your book 'Operating System Concepts' is due in 3 days. Please return or renew your book on time.",
        type: "DUE_ALERT",
        isRead: false,
        createdAt: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        userId,
        title: "⚠️ Overdue Fine Notice",
        message: "Your book 'Introduction to Algorithms' is 5 days overdue. A fine of ₹50 has been recorded.",
        type: "FINE_ALERT",
        isRead: false,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    await Notification.insertMany(sampleAlerts);
    res.status(201).json({ message: "Sample test notifications seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
