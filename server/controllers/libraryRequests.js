import LibraryRequest from "../models/LibraryRequest.js";

// Submit a new book request or complaint
export const createLibraryRequest = async (req, res) => {
  const userId = req.user.id;
  const { requestType, title, author, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Please provide a subject title." });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ message: "Please provide a description." });
  }

  try {
    const newRequest = new LibraryRequest({
      userId,
      requestType: requestType || "NEW_BOOK_SUGGESTION",
      title: title.trim(),
      author: author ? author.trim() : "",
      description: description.trim(),
      status: "PENDING"
    });

    await newRequest.save();

    res.status(201).json({
      message: "Library request/complaint submitted successfully!",
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's submitted requests and complaints
export const getStudentLibraryRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await LibraryRequest.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper: Seed sample test requests & complaints for Phase 9
export const seedSampleLibraryRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const sampleItems = [
      {
        userId,
        requestType: "NEW_BOOK_SUGGESTION",
        title: "Request for System Architecture Textbooks",
        author: "Martin Fowler",
        description: "Please add 'Patterns of Enterprise Application Architecture' to the computer science department section.",
        status: "PENDING"
      },
      {
        userId,
        requestType: "COMPLAINT",
        title: "Missing Pages in Operating System Book B003",
        author: "Silberschatz",
        description: "Pages 145 to 160 in the physical library copy B003 are damaged/torn.",
        status: "IN_PROGRESS",
        adminResponse: "Librarian inspected the copy. Replacement ordered from publisher."
      }
    ];

    await LibraryRequest.insertMany(sampleItems);
    res.status(201).json({ message: "Sample test requests & complaints seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Get all library requests and complaints
export const getAllLibraryRequests = async (req, res) => {
  try {
    const requests = await LibraryRequest.find()
      .populate("userId", "name email studentId")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update status and response note for a library request/complaint
export const updateLibraryRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminResponse } = req.body;

  try {
    const request = await LibraryRequest.findById(id).populate("userId", "name email studentId");
    if (!request) {
      return res.status(404).json({ message: "Library request not found" });
    }

    if (status) request.status = status;
    if (adminResponse !== undefined) request.adminResponse = adminResponse.trim();
    request.updatedAt = new Date();

    await request.save();

    res.status(200).json({
      message: "Library request updated successfully!",
      request
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
