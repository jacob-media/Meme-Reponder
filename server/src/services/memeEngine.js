import axios from "axios";

/* ------------------------------------------------------------------ */
/*  IMGFLIP – Generate memes with custom captions                      */
/* ------------------------------------------------------------------ */

// Popular meme templates mapped to moods/emotions for smart matching
const MEME_TEMPLATES = {
  joy: [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "438680",    name: "Batman Slapping Robin" },
    { id: "91538330",  name: "X, X Everywhere" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "124822590", name: "Left Exit 12 Off Ramp" },
  ],
  anger: [
    { id: "247375501", name: "Buff Doge vs. Cheems" },
    { id: "97984",     name: "Disaster Girl" },
    { id: "180190441", name: "Trade Offer" },
    { id: "438680",    name: "Batman Slapping Robin" },
    { id: "87743020",  name: "Two Buttons" },
  ],
  sadness: [
    { id: "259237855", name: "Crying Cat" },
    { id: "3218037",   name: "This Is Fine" },
    { id: "61579",     name: "One Does Not Simply" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "1035805",   name: "Boardroom Meeting Suggestion" },
  ],
  sarcasm: [
    { id: "101470",    name: "Ancient Aliens" },
    { id: "61520",     name: "Futurama Fry" },
    { id: "27813981",  name: "Hide the Pain Harold" },
    { id: "89370399",  name: "Roll Safe Think About It" },
    { id: "100777631", name: "Is This A Pigeon" },
  ],
  surprise: [
    { id: "252600902", name: "Always Has Been" },
    { id: "93895088",  name: "Expanding Brain" },
    { id: "148909805", name: "Monkey Puppet" },
    { id: "188390779", name: "Woman Yelling At Cat" },
    { id: "119139145", name: "Blank Nut Button" },
  ],
  neutral: [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "102156234", name: "Mocking Spongebob" },
    { id: "131087935", name: "Running Away Balloon" },
    { id: "217743513", name: "UNO Draw 25 Cards" },
    { id: "222403160", name: "Bernie I Am Once Again" },
  ],
  affection: [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "131087935", name: "Running Away Balloon" },
    { id: "188390779", name: "Woman Yelling At Cat" },
    { id: "124822590", name: "Left Exit 12 Off Ramp" },
    { id: "87743020",  name: "Two Buttons" },
  ],
  fear: [
    { id: "148909805", name: "Monkey Puppet" },
    { id: "3218037",   name: "This Is Fine" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "252600902", name: "Always Has Been" },
    { id: "97984",     name: "Disaster Girl" },
  ],
  disgust: [
    { id: "102156234", name: "Mocking Spongebob" },
    { id: "188390779", name: "Woman Yelling At Cat" },
    { id: "247375501", name: "Buff Doge vs. Cheems" },
    { id: "27813981",  name: "Hide the Pain Harold" },
    { id: "100777631", name: "Is This A Pigeon" },
  ],
};

/**
 * Generate a meme using the Imgflip API.
 * Selects a template based on the detected mood and generates captions.
 */
export async function generateMeme(memeContext, conversationText) {
  const mood = memeContext.mood || "neutral";
  const templates = MEME_TEMPLATES[mood] || MEME_TEMPLATES.neutral;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Generate clever captions based on conversation context
  const captions = generateCaptions(memeContext, conversationText, template.name);

  const username = process.env.IMGFLIP_USERNAME;
  const password = process.env.IMGFLIP_PASSWORD;

  // If no Imgflip credentials, return template info for client-side rendering
  if (!username || !password || username === "your_imgflip_username") {
    return {
      source: "template",
      template,
      captions,
      url: `https://imgflip.com/meme/${template.id}`,
      mood,
    };
  }

  try {
    const response = await axios.post(
      "https://api.imgflip.com/caption_image",
      null,
      {
        params: {
          template_id: template.id,
          username,
          password,
          text0: captions.top,
          text1: captions.bottom,
        },
      }
    );

    if (response.data.success) {
      return {
        source: "imgflip",
        url: response.data.data.url,
        pageUrl: response.data.data.page_url,
        template,
        captions,
        mood,
      };
    }
  } catch (err) {
    console.error("Imgflip API error:", err.message);
  }

  // Fallback
  return {
    source: "template",
    template,
    captions,
    url: `https://imgflip.com/meme/${template.id}`,
    mood,
  };
}

/**
 * Search for meme GIFs on Giphy.
 */
export async function searchMemeGifs(memeContext) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey || apiKey === "your_giphy_api_key") {
    // Return placeholder results when no API key
    return {
      source: "placeholder",
      query: memeContext.searchQuery,
      gifs: [],
      message: "Set GIPHY_API_KEY in .env to enable GIF search",
    };
  }

  try {
    const response = await axios.get("https://api.giphy.com/v1/gifs/search", {
      params: {
        api_key: apiKey,
        q: `${memeContext.searchQuery} meme`,
        limit: 6,
        rating: "pg-13",
        lang: "en",
      },
    });

    return {
      source: "giphy",
      query: memeContext.searchQuery,
      gifs: response.data.data.map((gif) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.fixed_height.url,
        originalUrl: gif.images.original.url,
        width: gif.images.fixed_height.width,
        height: gif.images.fixed_height.height,
        embedUrl: gif.embed_url,
      })),
    };
  } catch (err) {
    console.error("Giphy API error:", err.message);
    return { source: "error", query: memeContext.searchQuery, gifs: [], error: err.message };
  }
}

/**
 * Search for popular memes from Reddit/meme APIs (no auth required).
 */
export async function searchWebMemes(memeContext) {
  try {
    // Use free meme API
    const response = await axios.get("https://meme-api.com/gimme/memes/6");
    const memes = response.data.memes || [];

    return {
      source: "reddit",
      memes: memes.map((m) => ({
        title: m.title,
        url: m.url,
        postLink: m.postLink,
        subreddit: m.subreddit,
        author: m.author,
        nsfw: m.nsfw,
      })),
      mood: memeContext.mood,
    };
  } catch (err) {
    console.error("Meme API error:", err.message);
    return { source: "error", memes: [], error: err.message };
  }
}

/* ------------------------------------------------------------------ */
/*  Caption Generation                                                 */
/* ------------------------------------------------------------------ */
function generateCaptions(memeContext, text, templateName) {
  const { mood, sentiment, tone } = memeContext;

  // Context-aware caption strategies
  const strategies = {
    joy: {
      top: "When the conversation is going great",
      bottom: "And you can't stop smiling",
    },
    anger: {
      top: "Me reading this conversation",
      bottom: "Trying not to lose it",
    },
    sadness: {
      top: "This conversation got me like",
      bottom: "Pain. Just pain.",
    },
    sarcasm: {
      top: "Oh really?",
      bottom: "Tell me more about that",
    },
    surprise: {
      top: "Wait what??",
      bottom: "Did they really just say that",
    },
    affection: {
      top: "When bae texts you",
      bottom: "And it's actually sweet",
    },
    fear: {
      top: "When you see that text",
      bottom: "And your heart drops",
    },
    disgust: {
      top: "Me after reading that",
      bottom: "Absolutely not",
    },
    neutral: {
      top: "When someone texts you",
      bottom: "And you don't know what to say",
    },
  };

  // Try to extract a short snippet from the conversation for the caption
  const shortText = text.length > 40 ? text.substring(0, 37) + "..." : text;

  const base = strategies[mood] || strategies.neutral;

  // Make it more specific when we have conversation text
  if (text && text.length > 5) {
    return {
      top: `"${shortText}"`,
      bottom: base.bottom,
    };
  }

  return base;
}
