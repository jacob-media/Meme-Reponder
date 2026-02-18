/**
 * Meme engine running entirely in the browser.
 * Uses free APIs that support CORS or returns template data.
 */

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
 * Generate a meme locally — picks a template + captions based on mood.
 */
export function generateMeme(memeContext, conversationText) {
  const mood = memeContext.mood || "neutral";
  const templates = MEME_TEMPLATES[mood] || MEME_TEMPLATES.neutral;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const base = CAPTION_STRATEGIES[mood] || CAPTION_STRATEGIES.neutral;

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
      url: `https://imgflip.com/meme/${template.id}`,
      imageUrl: `https://i.imgflip.com/${template.id}.jpg`,
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
