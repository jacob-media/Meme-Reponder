/**
 * Meme engine running entirely in the browser.
 * Uses verified Imgflip image URLs and free Reddit meme API.
 */

// Verified image URLs from the Imgflip API (hash slugs, not numeric IDs)
const IMAGE_URLS = {
  "181913649": "https://i.imgflip.com/30b1gx.jpg",
  "438680":    "https://i.imgflip.com/9ehk.jpg",
  "91538330":  "https://i.imgflip.com/1ihzfe.jpg",
  "4087833":   "https://i.imgflip.com/2fm6x.jpg",
  "124822590": "https://i.imgflip.com/22bdq6.jpg",
  "247375501": "https://i.imgflip.com/43a45p.png",
  "97984":     "https://i.imgflip.com/23ls.jpg",
  "180190441": "https://i.imgflip.com/2za3u1.jpg",
  "87743020":  "https://i.imgflip.com/1g8my4.jpg",
  "259237855": "https://i.imgflip.com/4acd7j.png",
  "3218037":   "https://i.imgflip.com/1wz1x.jpg",
  "61579":     "https://i.imgflip.com/1bij.jpg",
  "1035805":   "https://i.imgflip.com/m78d.jpg",
  "101470":    "https://i.imgflip.com/26am.jpg",
  "61520":     "https://i.imgflip.com/1bgw.jpg",
  "27813981":  "https://i.imgflip.com/gk5el.jpg",
  "89370399":  "https://i.imgflip.com/1h7in3.jpg",
  "100777631": "https://i.imgflip.com/1o00in.jpg",
  "252600902": "https://i.imgflip.com/46e43q.png",
  "93895088":  "https://i.imgflip.com/1jwhww.jpg",
  "148909805": "https://i.imgflip.com/2gnnjh.jpg",
  "188390779": "https://i.imgflip.com/345v97.jpg",
  "119139145": "https://i.imgflip.com/1yxkcp.jpg",
  "102156234": "https://i.imgflip.com/1otk96.jpg",
  "131087935": "https://i.imgflip.com/261o3j.jpg",
  "217743513": "https://i.imgflip.com/3lmzyx.jpg",
  "222403160": "https://i.imgflip.com/3oevdk.jpg",
};

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

const CAPTION_STRATEGIES = {
  joy:       { top: "When the conversation is going great", bottom: "And you can't stop smiling" },
  anger:     { top: "Me reading this conversation",         bottom: "Trying not to lose it" },
  sadness:   { top: "This conversation got me like",        bottom: "Pain. Just pain." },
  sarcasm:   { top: "Oh really?",                           bottom: "Tell me more about that" },
  surprise:  { top: "Wait what??",                          bottom: "Did they really just say that" },
  affection: { top: "When bae texts you",                   bottom: "And it's actually sweet" },
  fear:      { top: "When you see that text",               bottom: "And your heart drops" },
  disgust:   { top: "Me after reading that",                bottom: "Absolutely not" },
  neutral:   { top: "When someone texts you",               bottom: "And you don't know what to say" },
};

/**
 * Resolve the actual image URL for a template ID.
 */
let _apiCache = null;

async function resolveImageUrl(templateId) {
  if (IMAGE_URLS[templateId]) return IMAGE_URLS[templateId];

  // Fallback: fetch from Imgflip API and cache
  if (!_apiCache) {
    try {
      const res = await fetch("https://api.imgflip.com/get_memes");
      const data = await res.json();
      if (data.success) {
        _apiCache = {};
        for (const m of data.data.memes) _apiCache[m.id] = m.url;
      }
    } catch { _apiCache = {}; }
  }
  return _apiCache?.[templateId] || null;
}

/**
 * Generate a meme — picks a template + captions based on mood.
 */
export async function generateMeme(memeContext, conversationText) {
  const mood = memeContext.mood || "neutral";
  const templates = MEME_TEMPLATES[mood] || MEME_TEMPLATES.neutral;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const base = CAPTION_STRATEGIES[mood] || CAPTION_STRATEGIES.neutral;

  const imageUrl = await resolveImageUrl(template.id);

  const shortText =
    conversationText && conversationText.length > 5
      ? conversationText.length > 40
        ? `"${conversationText.substring(0, 37)}..."`
        : `"${conversationText}"`
      : null;

  const captions = {
    top: shortText || base.top,
    bottom: base.bottom,
  };

  return {
    success: true,
    meme: {
      source: "template",
      template,
      captions,
      imageUrl,
      mood,
    },
  };
}

/**
 * Fetch memes from a free, CORS-enabled meme API (Reddit).
 */
export async function fetchWebMemes(memeContext) {
  try {
    const response = await fetch("https://meme-api.com/gimme/memes/6");
    const data = await response.json();
    const memes = data.memes || [];

    return {
      success: true,
      source: "reddit",
      memes: memes.map((m) => ({
        title: m.title,
        url: m.url,
        postLink: m.postLink,
        subreddit: m.subreddit,
        author: m.author,
      })),
      mood: memeContext?.mood,
    };
  } catch (err) {
    console.error("Meme API error:", err);
    return { success: false, source: "error", memes: [], error: err.message };
  }
}
