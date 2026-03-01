import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import albumsRoutes from "./routes/albums.js";
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/albums", authMiddleware, albumsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Albums API is running ✅ Use /api/albums");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
