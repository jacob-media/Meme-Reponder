import Tesseract from "tesseract.js";
import sharp from "sharp";
import path from "path";

/**
 * Pre-process the image for better OCR accuracy on messaging screenshots.
 * Converts to grayscale, increases contrast, and sharpens.
 */
async function preprocessImage(imagePath) {
  const processedPath = imagePath.replace(
    path.extname(imagePath),
    "_processed.png"
  );

  await sharp(imagePath)
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(180)
    .toFile(processedPath);

  return processedPath;
}

/**
 * Extract text from a messaging app screenshot using Tesseract OCR.
 * Returns structured data with individual messages parsed out.
 */
export async function extractText(imagePath) {
  // Pre-process for better accuracy
  let processedPath;
  try {
    processedPath = await preprocessImage(imagePath);
  } catch {
    processedPath = imagePath; // Fall back to original if processing fails
  }

  const {
    data: { text, confidence },
  } = await Tesseract.recognize(processedPath, "eng", {
    logger: (info) => {
      if (info.status === "recognizing text") {
        // Progress tracking available here
      }
    },
  });

  // Parse individual messages from the raw text
  const messages = parseMessages(text);

  return {
    rawText: text.trim(),
    confidence,
    messages,
    messageCount: messages.length,
  };
}

/**
 * Parse raw OCR text into individual message objects.
 * Handles common messaging app formats (iMessage, WhatsApp, SMS, etc.)
 */
function parseMessages(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const messages = [];
  let currentMessage = "";

  for (const line of lines) {
    // Skip common UI elements from screenshots
    if (isUIElement(line)) continue;

    // Detect timestamp patterns (common across messaging apps)
    const timestampMatch = line.match(
      /^(\d{1,2}:\d{2}\s*(AM|PM)?)|^(Today|Yesterday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
    );

    if (timestampMatch) {
      if (currentMessage) {
        messages.push({ text: currentMessage.trim(), type: "message" });
      }
      currentMessage = line.replace(timestampMatch[0], "").trim();
    } else {
      // Accumulate multi-line messages
      currentMessage += (currentMessage ? " " : "") + line;
    }
  }

  // Push the last message
  if (currentMessage) {
    messages.push({ text: currentMessage.trim(), type: "message" });
  }

  // If no structured messages found, treat the whole text as one block
  if (messages.length === 0 && rawText.trim()) {
    messages.push({ text: rawText.trim(), type: "message" });
  }

  return messages;
}

/**
 * Filter out common UI elements found in messaging app screenshots.
 */
function isUIElement(line) {
  const uiPatterns = [
    /^(iMessage|SMS|MMS)$/i,
    /^Delivered$/i,
    /^Read\s/i,
    /^Typing\.\.\.$/i,
    /^(Send|Type a message)/i,
    /^\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    /^(Wi-Fi|LTE|5G|4G|3G)/i,
    /^\d{1,2}:\d{2}$/,
    /^(AT&T|Verizon|T-Mobile|Sprint)/i,
  ];
  return uiPatterns.some((p) => p.test(line.trim()));
}
