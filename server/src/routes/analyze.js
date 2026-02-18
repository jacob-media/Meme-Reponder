import { Router } from "express";
import multer from "multer";
import path from "path";
import { extractText } from "../services/ocr.js";
import { analyzeConversation } from "../services/analyzer.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|bmp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

/**
 * POST /api/analyze/screenshot
 * Upload a messaging screenshot → OCR → full analysis
 */
router.post("/screenshot", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No screenshot file uploaded" });
    }

    const imagePath = req.file.path;

    // Step 1: OCR – extract text from screenshot
    const ocrResult = await extractText(imagePath);

    if (!ocrResult.rawText) {
      return res.status(422).json({
        error: "Could not extract any text from the screenshot",
        suggestion: "Try a clearer screenshot with visible text",
      });
    }

    // Step 2: Analyze the extracted conversation
    const analysis = analyzeConversation(ocrResult);

    return res.json({
      success: true,
      ocr: {
        text: ocrResult.rawText,
        confidence: ocrResult.confidence,
        messageCount: ocrResult.messageCount,
        messages: ocrResult.messages,
      },
      analysis,
      imagePath: `/${req.file.path.replace(/\\/g, "/")}`,
    });
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "Failed to analyze screenshot", details: err.message });
  }
});

/**
 * POST /api/analyze/text
 * Directly analyze text (bypass OCR)
 */
router.post("/text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    // Build a synthetic OCR result for the analyzer
    const messages = text.split("\n").filter(Boolean).map((t) => ({ text: t.trim(), type: "message" }));
    const fakeOcrResult = {
      rawText: text,
      confidence: 100,
      messages,
      messageCount: messages.length,
    };

    const analysis = analyzeConversation(fakeOcrResult);

    return res.json({
      success: true,
      ocr: fakeOcrResult,
      analysis,
    });
  } catch (err) {
    console.error("Text analysis error:", err);
    return res.status(500).json({ error: "Failed to analyze text", details: err.message });
  }
});

export { router as analyzeRouter };
