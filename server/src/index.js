import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeRouter } from "./routes/analyze.js";
import { memeRouter } from "./routes/meme.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/meme", memeRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Meme Responder API running on http://localhost:${PORT}`);
});
