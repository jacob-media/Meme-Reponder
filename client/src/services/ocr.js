import Tesseract from "tesseract.js";

/**
 * Extract text from a messaging app screenshot using Tesseract OCR in the browser.
 */
export async function extractText(imageSource, onProgress) {
  const { data: { text, confidence } } = await Tesseract.recognize(
    imageSource,
    "eng",
    {
      logger: (info) => {
        if (info.status === "recognizing text" && onProgress) {
          onProgress(Math.round(info.progress * 100));
        }
      },
    }
  );

  const messages = parseMessages(text);

  return {
    rawText: text.trim(),
    confidence,
    messages,
    messageCount: messages.length,
  };
}

function parseMessages(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const messages = [];
  let currentMessage = "";

  for (const line of lines) {
    if (isUIElement(line)) continue;

    const timestampMatch = line.match(
      /^(\d{1,2}:\d{2}\s*(AM|PM)?)|^(Today|Yesterday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
    );

    if (timestampMatch) {
      if (currentMessage) {
        messages.push({ text: currentMessage.trim(), type: "message" });
      }
      currentMessage = line.replace(timestampMatch[0], "").trim();
    } else {
      currentMessage += (currentMessage ? " " : "") + line;
    }
  }

  if (currentMessage) {
    messages.push({ text: currentMessage.trim(), type: "message" });
  }

  if (messages.length === 0 && rawText.trim()) {
    messages.push({ text: rawText.trim(), type: "message" });
  }

  return messages;
}

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
