// Using Giphy API for meme search
// Note: In production, you'd want to use your own API key and keep it secure
// For demo purposes, we're using a basic public key approach

const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65' // Public beta key for demos
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs'

/**
 * Search for memes/GIFs based on keywords
 * @param {string[]} keywords - Search keywords
 * @param {number} limit - Max results to return
 * @returns {Promise<Array>} Array of meme objects
 */
export async function searchMemes(keywords, limit = 12) {
  try {
    const query = keywords.join(' ')
    const url = `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=pg-13`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch memes')
    
    const data = await response.json()
    
    return data.data.map(gif => ({
      id: gif.id,
      title: gif.title,
      url: gif.images.fixed_height.url,
      originalUrl: gif.images.original.url,
      previewUrl: gif.images.preview_gif?.url || gif.images.fixed_height_small.url,
      width: parseInt(gif.images.fixed_height.width),
      height: parseInt(gif.images.fixed_height.height),
      source: 'giphy'
    }))
  } catch (error) {
    console.error('Meme search error:', error)
    // Return some fallback memes if API fails
    return getFallbackMemes()
  }
}

/**
 * Get trending memes
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Array of meme objects
 */
export async function getTrendingMemes(limit = 8) {
  try {
    const url = `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch trending memes')
    
    const data = await response.json()
    
    return data.data.map(gif => ({
      id: gif.id,
      title: gif.title,
      url: gif.images.fixed_height.url,
      originalUrl: gif.images.original.url,
      previewUrl: gif.images.preview_gif?.url || gif.images.fixed_height_small.url,
      width: parseInt(gif.images.fixed_height.width),
      height: parseInt(gif.images.fixed_height.height),
      source: 'giphy'
    }))
  } catch (error) {
    console.error('Trending memes error:', error)
    return getFallbackMemes()
  }
}

/**
 * Get fallback memes if API fails
 */
function getFallbackMemes() {
  return [
    {
      id: 'fallback1',
      title: 'Thinking Face',
      url: 'https://media.giphy.com/media/a5viI92PAF89q/giphy.gif',
      originalUrl: 'https://media.giphy.com/media/a5viI92PAF89q/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/a5viI92PAF89q/giphy-preview.gif',
      width: 200,
      height: 200,
      source: 'fallback'
    },
    {
      id: 'fallback2',
      title: 'Mind Blown',
      url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
      originalUrl: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
      previewUrl: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy-preview.gif',
      width: 200,
      height: 200,
      source: 'fallback'
    }
  ]
}

// Popular meme templates for custom generation
export const MEME_TEMPLATES = [
  {
    id: 'drake',
    name: 'Drake Hotline Bling',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    textAreas: [
      { x: 270, y: 100, maxWidth: 270, fontSize: 32 },
      { x: 270, y: 300, maxWidth: 270, fontSize: 32 }
    ]
  },
  {
    id: 'distracted',
    name: 'Distracted Boyfriend',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    textAreas: [
      { x: 100, y: 50, maxWidth: 150, fontSize: 24 }
    ]
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    url: 'https://i.imgflip.com/24y43o.jpg',
    textAreas: [
      { x: 300, y: 210, maxWidth: 300, fontSize: 28 }
    ]
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    url: 'https://i.imgflip.com/1g8my4.jpg',
    textAreas: [
      { x: 80, y: 80, maxWidth: 120, fontSize: 20 },
      { x: 200, y: 80, maxWidth: 120, fontSize: 20 }
    ]
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    textAreas: [
      { x: 20, y: 30, maxWidth: 250, fontSize: 18 }
    ]
  },
  {
    id: 'is-this',
    name: 'Is This a Pigeon?',
    url: 'https://i.imgflip.com/1o00in.jpg',
    textAreas: [
      { x: 250, y: 380, maxWidth: 500, fontSize: 32 }
    ]
  }
]

export default {
  searchMemes,
  getTrendingMemes,
  MEME_TEMPLATES
}
