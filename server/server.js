import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import albumsRoutes from "./routes/albums.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/albums", albumsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Albums API is running ✅ Use /api/albums");
});

// Health check
app.get("/api/health", (req, res) => {
  console.log("✅ /api/health was hit");
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

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
