/**
 * Renders meme text onto a template image using HTML Canvas.
 * Returns a data URL of the finished meme.
 */

/**
 * Load an image from a URL, bypassing CORS via a proxy if needed.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Try with a CORS proxy as fallback
      const proxied = new window.Image();
      proxied.crossOrigin = "anonymous";
      proxied.onload = () => resolve(proxied);
      proxied.onerror = reject;
      proxied.src = `https://corsproxy.io/?${encodeURIComponent(src)}`;
    };
    img.src = src;
  });
}

/**
 * Draw meme-style text (white with black outline) on a canvas context.
 */
function drawMemeText(ctx, text, x, y, maxWidth, fontSize) {
  ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Word-wrap the text
  const lines = wrapText(ctx, text.toUpperCase(), maxWidth);

  for (let i = 0; i < lines.length; i++) {
    const lineY = y + i * (fontSize * 1.15);

    // Black outline (draw multiple offsets for bold outline)
    ctx.strokeStyle = "black";
    ctx.lineWidth = fontSize / 8;
    ctx.lineJoin = "round";
    ctx.strokeText(lines[i], x, lineY);

    // White fill
    ctx.fillStyle = "white";
    ctx.fillText(lines[i], x, lineY);
  }

  return lines.length;
}

/**
 * Word-wrap text to fit within maxWidth.
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Render a complete meme: template image + top/bottom captions.
 * Returns a data URL (image/png) of the finished meme.
 */
export async function renderMeme(imageUrl, topText, bottomText) {
  const img = await loadImage(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");

  // Draw the template image
  ctx.drawImage(img, 0, 0);

  const w = canvas.width;
  const h = canvas.height;
  const padding = w * 0.05;
  const maxWidth = w - padding * 2;
  const fontSize = Math.max(Math.min(w / 12, 72), 24);

  // Draw top text
  if (topText) {
    drawMemeText(ctx, topText, w / 2, padding, maxWidth, fontSize);
  }

  // Draw bottom text (from bottom up)
  if (bottomText) {
    // Measure how many lines so we can position from the bottom
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    const lines = wrapText(ctx, bottomText.toUpperCase(), maxWidth);
    const totalHeight = lines.length * fontSize * 1.15;
    const bottomY = h - totalHeight - padding;
    drawMemeText(ctx, bottomText, w / 2, bottomY, maxWidth, fontSize);
  }

  return canvas.toDataURL("image/png");
}

/**
 * Trigger a download of a data URL as a file.
 */
export function downloadMeme(dataUrl, filename = "meme-response.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
