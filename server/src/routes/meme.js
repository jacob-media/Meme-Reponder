import { Router } from "express";
import {
  generateMeme,
  searchMemeGifs,
  searchWebMemes,
} from "../services/memeEngine.js";

const router = Router();

/**
 * POST /api/meme/generate
 * Generate a meme based on conversation analysis.
 * Body: { memeContext, conversationText }
 */
router.post("/generate", async (req, res) => {
  try {
    const { memeContext, conversationText } = req.body;
    if (!memeContext) {
      return res.status(400).json({ error: "memeContext is required" });
    }

    const meme = await generateMeme(memeContext, conversationText || "");
    return res.json({ success: true, meme });
  } catch (err) {
    console.error("Meme generation error:", err);
    return res.status(500).json({ error: "Failed to generate meme", details: err.message });
  }
});

/**
 * POST /api/meme/gifs
 * Search for meme GIFs based on analysis context.
 */
router.post("/gifs", async (req, res) => {
  try {
    const { memeContext } = req.body;
    if (!memeContext) {
      return res.status(400).json({ error: "memeContext is required" });
    }

    const result = await searchMemeGifs(memeContext);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("GIF search error:", err);
    return res.status(500).json({ error: "Failed to search GIFs", details: err.message });
  }
});

/**
 * POST /api/meme/web
 * Fetch trending/relevant memes from the web.
 */
router.post("/web", async (req, res) => {
  try {
    const { memeContext } = req.body;
    const result = await searchWebMemes(memeContext || { mood: "neutral", searchQuery: "funny" });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("Web meme error:", err);
    return res.status(500).json({ error: "Failed to fetch memes", details: err.message });
  }
});

export { router as memeRouter };
