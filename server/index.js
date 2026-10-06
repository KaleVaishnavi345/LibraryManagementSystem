import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import notificationRoutes from "./routes/notifications.js";
import libraryRequestRoutes from "./routes/libraryRequests.js";
import waitingListRoutes from "./routes/waitingList.js";
import adminRoutes from "./routes/admin.js";
import { seedDefaultAdminUser } from "./controllers/auth.js";
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url'; 

dotenv.config();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);    
const __dirname = path.dirname(__filename); 

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
// Routes 
app.use("/auth", authRoutes); // http://localhost:8080/auth/ 
app.use("/book", bookRoutes); // http://localhost:8080/book/ 
app.use("/notifications", notificationRoutes); // http://localhost:8080/notifications/
app.use("/library-requests", libraryRequestRoutes); // http://localhost:8080/library-requests/
app.use("/waiting-list", waitingListRoutes); // http://localhost:8080/waiting-list/
app.use("/admin", adminRoutes); // http://localhost:8080/admin/





// Connect to MongoDB
const PORT = process.env.PORT || 8080;
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await seedDefaultAdminUser();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
