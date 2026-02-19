import Tesseract from 'tesseract.js'

/**
 * Perform OCR on an image file
 * @param {File|string} image - Image file or URL
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromImage(image, onProgress = () => {}) {
  try {
    const result = await Tesseract.recognize(
      image,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100))
          }
        }
      }
    )
    
    return result.data.text
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to extract text from image. Please try again or paste text directly.')
  }
}

/**
 * Clean and format OCR output
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
export function cleanOCRText(text) {
  return text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Remove empty lines but keep conversation structure
    .replace(/\n{3,}/g, '\n\n')
    // Fix common OCR mistakes
    .replace(/[|](?=\w)/g, 'I') // | before word is usually I
    .replace(/0(?=[a-zA-Z])/g, 'O') // 0 before letter is usually O
    .replace(/1(?=[a-zA-Z]{2,})/g, 'l') // 1 before letters is usually l
    .trim()
}

export default {
  extractTextFromImage,
  cleanOCRText
}
