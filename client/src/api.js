import axios from "axios";

const API_BASE = "/api";

/**
 * Upload a screenshot for OCR + analysis.
 */
export async function analyzeScreenshot(file) {
  const formData = new FormData();
  formData.append("screenshot", file);

  const { data } = await axios.post(`${API_BASE}/analyze/screenshot`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Analyze raw text directly (skip OCR).
 */
export async function analyzeText(text) {
  const { data } = await axios.post(`${API_BASE}/analyze/text`, { text });
  return data;
}

/**
 * Generate a meme from analysis results.
 */
export async function generateMeme(memeContext, conversationText) {
  const { data } = await axios.post(`${API_BASE}/meme/generate`, {
    memeContext,
    conversationText,
  });
  return data;
}

/**
 * Search for meme GIFs.
 */
export async function searchGifs(memeContext) {
  const { data } = await axios.post(`${API_BASE}/meme/gifs`, { memeContext });
  return data;
}

/**
 * Fetch web memes.
 */
export async function fetchWebMemes(memeContext) {
  const { data } = await axios.post(`${API_BASE}/meme/web`, { memeContext });
  return data;
}
