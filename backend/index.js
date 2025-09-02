// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from ../config
dotenv.config({ path: path.join(__dirname, "../config/.env") });

const app = express();
app.use(cors());
app.use(express.json());

// simple test route
app.get("/", (req, res) => {
  res.send("Gym Sync Backend is running 🚀");
});

// connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

  app.use("/api/users", userRoutes);