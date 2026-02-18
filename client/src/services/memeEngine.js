/**
 * Smart meme engine — generates contextually relevant memes
 * based on conversation hooks, themes, and keywords.
 * No generic filler text — captions are built from actual content.
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

/* ────────────────────────────────────────────────────────────
 *  TEMPLATE POOLS
 * ──────────────────────────────────────────────────────────── */

/** Theme-based templates (preferred — matches content, not just emotion) */
const THEME_TEMPLATES = {
  "apology": [
    { id: "27813981",  name: "Hide the Pain Harold" },
    { id: "3218037",   name: "This Is Fine" },
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "131087935", name: "Running Away Balloon" },
    { id: "102156234", name: "Mocking Spongebob" },
  ],
  "argument": [
    { id: "188390779", name: "Woman Yelling At Cat" },
    { id: "87743020",  name: "Two Buttons" },
    { id: "438680",    name: "Batman Slapping Robin" },
    { id: "247375501", name: "Buff Doge vs. Cheems" },
    { id: "1035805",   name: "Boardroom Meeting Suggestion" },
  ],
  "making plans": [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "124822590", name: "Left Exit 12 Off Ramp" },
    { id: "217743513", name: "UNO Draw 25 Cards" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "61520",     name: "Futurama Fry" },
  ],
  "relationship": [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "131087935", name: "Running Away Balloon" },
    { id: "87743020",  name: "Two Buttons" },
    { id: "148909805", name: "Monkey Puppet" },
  ],
  "work/school": [
    { id: "3218037",   name: "This Is Fine" },
    { id: "1035805",   name: "Boardroom Meeting Suggestion" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "27813981",  name: "Hide the Pain Harold" },
    { id: "89370399",  name: "Roll Safe Think About It" },
  ],
  "food": [
    { id: "87743020",  name: "Two Buttons" },
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "4087833",   name: "Waiting Skeleton" },
    { id: "61520",     name: "Futurama Fry" },
  ],
  "gossip": [
    { id: "93895088",  name: "Expanding Brain" },
    { id: "148909805", name: "Monkey Puppet" },
    { id: "252600902", name: "Always Has Been" },
    { id: "119139145", name: "Blank Nut Button" },
  ],
  "celebration": [
    { id: "91538330",  name: "X, X Everywhere" },
    { id: "93895088",  name: "Expanding Brain" },
    { id: "181913649", name: "Drake Hotline Bling" },
  ],
  "support": [
    { id: "181913649", name: "Drake Hotline Bling" },
    { id: "3218037",   name: "This Is Fine" },
    { id: "27813981",  name: "Hide the Pain Harold" },
  ],
  "humor": [
    { id: "102156234", name: "Mocking Spongebob" },
    { id: "101470",    name: "Ancient Aliens" },
    { id: "89370399",  name: "Roll Safe Think About It" },
    { id: "100777631", name: "Is This A Pigeon" },
  ],
};

/** Mood-based templates (fallback when no theme matches) */
const MOOD_TEMPLATES = {
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

/* ────────────────────────────────────────────────────────────
 *  TEXT UTILITIES
 * ──────────────────────────────────────────────────────────── */

/** Strip timestamps, UI artifacts, and delivery-status lines. */
function stripMetadata(text) {
  let t = text;
  t = t.replace(/^\d{1,2}:\d{2}\s*(AM|PM)?\s*/i, "");
  t = t.replace(/^(Today|Yesterday)\s*/i, "");
  t = t.replace(/^(Delivered|Read|Sent|Typing)\b.*$/i, "");
  return t.trim();
}

/**
 * Conditionally keep a "Name:" prefix only when the body is short/punchy
 * (reads funnier as a quote, e.g. "Jacob: Can I get a review?").
 * Otherwise strip the sender to keep the caption clean.
 */
function conditionalSender(messageText) {
  const m = messageText.match(/^([A-Za-z]\w{0,15})\s*:\s*(.+)/);
  if (!m) return stripMetadata(messageText);

  const sender = m[1];
  const body = stripMetadata(m[2]);
  const wordCount = body.split(/\s+/).length;

  // Keep the sender when the body is short & punchy (setup-like)
  if (wordCount <= 8 && /[?!]/.test(body)) {
    return `${sender}: ${body}`;
  }
  return body;
}

/**
 * Clean text for meme captions:
 * - strip wrapping quotes (keep internal dialogue quotes)
 * - capitalize first letter
 * - collapse whitespace
 */
function cleanCaption(text) {
  let t = text;
  // Remove wrapping quote marks of all kinds
  t = t.replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length > 0) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

function truncate(text, max = 55) {
  if (text.length <= max) return text;
  return text.substring(0, max - 3).trimEnd() + "...";
}

/* ────────────────────────────────────────────────────────────
 *  HOOK DETECTION
 *  Scans messages + themes for the comedic element:
 *  contradictions, dismissive replies, escalation, etc.
 * ──────────────────────────────────────────────────────────── */

function findMostChargedMessage(texts) {
  let best = null;
  let bestScore = 0;
  for (const t of texts) {
    let s = 0;
    s += (t.match(/!/g) || []).length * 2;
    s += (t.match(/\?/g) || []).length * 1.5;
    s += (t.match(/[A-Z]{2,}/g) || []).length * 3;
    if (/wtf|omg|seriously|can't believe|really|bruh/i.test(t)) s += 5;
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
}

/**
 * Return { type, setup, punchline, score } describing the best hook.
 */
function identifyHook(messages, themes, mood) {
  const texts = messages.map((m) => m.text);
  if (texts.length === 0) {
    return { type: "none", setup: null, punchline: null, score: 0 };
  }

  const hooks = [];

  // ── Contradiction: apology followed by an ask / demand ──────────
  if (themes.includes("apology")) {
    const apIdx = texts.findIndex((t) =>
      /sorry|apologize|my bad|forgive/i.test(t)
    );
    const askIdx = texts.findIndex((t) =>
      /can you|could you|would you|please|need you|want you|rate|review/i.test(t)
    );
    if (apIdx >= 0 && askIdx >= 0 && askIdx >= apIdx) {
      hooks.push({
        type: "contradiction",
        setup: truncate(conditionalSender(texts[apIdx])),
        punchline: truncate(conditionalSender(texts[askIdx])),
        score: 10,
      });
    }
  }

  // ── Dismissive: long essay → tiny reply ─────────────────────────
  for (let i = 1; i < texts.length; i++) {
    if (texts[i - 1].length > 80 && texts[i].length < 15) {
      hooks.push({
        type: "dismissive",
        setup: "After that entire essay",
        punchline: truncate(conditionalSender(texts[i]), 45),
        score: 9,
      });
      break; // only need the first one
    }
  }

  // ── Escalation: caps / punctuation ramp up over the conversation ─
  if (texts.length >= 4) {
    const half = Math.ceil(texts.length / 2);
    const early = texts.slice(0, half).join(" ");
    const late = texts.slice(half).join(" ");
    const earlyCaps = (early.match(/[A-Z]{2,}/g) || []).length;
    const lateCaps = (late.match(/[A-Z]{2,}/g) || []).length;
    if (lateCaps > earlyCaps + 2) {
      hooks.push({
        type: "escalation",
        setup: "How the conversation started",
        punchline: "How it ended up",
        score: 6,
      });
    }
  }

  // ── Argument: surface the most emotionally charged message ──────
  if (themes.includes("argument")) {
    const charged = findMostChargedMessage(texts);
    if (charged) {
      hooks.push({
        type: "argument",
        setup: "Them right now",
        punchline: truncate(stripMetadata(charged)),
        score: 7,
      });
    }
  }

  // ── Gossip: the reveal ──────────────────────────────────────────
  if (themes.includes("gossip")) {
    hooks.push({
      type: "gossip",
      setup: "Wait they said WHAT",
      punchline: truncate(conditionalSender(texts[texts.length - 1])),
      score: 7,
    });
  }

  // ── Awkward ask: a question juxtaposed with prior context ───────
  const questions = texts.filter((t) => /\?/.test(t));
  if (questions.length > 0 && texts.length >= 2) {
    const q = questions[questions.length - 1];
    const qIdx = texts.lastIndexOf(q);
    const before = qIdx > 0 ? texts[qIdx - 1] : null;
    if (before) {
      hooks.push({
        type: "awkward_ask",
        setup: truncate(conditionalSender(before)),
        punchline: truncate(conditionalSender(q)),
        score: 5,
      });
    }
  }

  // ── Default: last two messages as setup / punchline ─────────────
  if (texts.length >= 2) {
    hooks.push({
      type: "last_pair",
      setup: truncate(conditionalSender(texts[texts.length - 2])),
      punchline: truncate(conditionalSender(texts[texts.length - 1])),
      score: 3,
    });
  } else {
    hooks.push({
      type: "single",
      setup: null,
      punchline: truncate(conditionalSender(texts[0])),
      score: 1,
    });
  }

  hooks.sort((a, b) => b.score - a.score);
  return hooks[0];
}

/* ────────────────────────────────────────────────────────────
 *  TEMPLATE SELECTION  (theme-first, mood-fallback)
 * ──────────────────────────────────────────────────────────── */

function selectTemplate(themes, mood) {
  // Prefer a theme-matched template
  for (const theme of themes) {
    const pool = THEME_TEMPLATES[theme];
    if (pool?.length) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  // Fall back to mood
  const pool = MOOD_TEMPLATES[mood] || MOOD_TEMPLATES.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ────────────────────────────────────────────────────────────
 *  DYNAMIC CAPTION GENERATION
 *
 *  Frames use placeholders:
 *    {s} = hook setup     {p} = hook punchline
 *    {k} = first keyword
 * ──────────────────────────────────────────────────────────── */

const THEME_FRAMES = {
  "apology": [
    { top: "{s}", bottom: "But then: {p}" },
    { top: "The apology was nice", bottom: "{p}" },
    { top: "Them: {s}", bottom: "Also them: {p}" },
  ],
  "argument": [
    { top: "{s}", bottom: "{p}" },
    { top: "Me trying to keep the peace", bottom: "Them: {p}" },
    { top: "The audacity of saying", bottom: "{p}" },
  ],
  "making plans": [
    { top: "The plan: {s}", bottom: "Reality: {p}" },
    { top: "{s}", bottom: "Still waiting" },
    { top: "When they finally commit", bottom: "{p}" },
  ],
  "relationship": [
    { top: "{s}", bottom: "{p}" },
    { top: "This relationship be like", bottom: "{p}" },
  ],
  "work/school": [
    { top: "When {k} comes up", bottom: "{p}" },
    { top: "{s}", bottom: "Me clocking out mentally" },
  ],
  "food": [
    { top: "Where are we eating?", bottom: "{p}" },
    { top: "{s}", bottom: "Still can't decide" },
  ],
  "gossip": [
    { top: "Wait they said WHAT", bottom: "{p}" },
    { top: "{s}", bottom: "SPILL" },
  ],
  "celebration": [
    { top: "LET'S GOOOO", bottom: "{p}" },
    { top: "{s}", bottom: "Massive W" },
  ],
  "support": [
    { top: "When someone actually checks on you", bottom: "{p}" },
    { top: "{s}", bottom: "And they actually mean it" },
  ],
  "humor": [
    { top: "{s}", bottom: "{p}" },
    { top: "I can't with this conversation", bottom: "{p}" },
  ],
};

const MOOD_FRAMES = {
  joy:       [{ top: "{s}", bottom: "{p}" }, { top: "This energy right here", bottom: "{p}" }],
  anger:     [{ top: "The AUDACITY", bottom: "{p}" }, { top: "{s}", bottom: "{p}" }],
  sadness:   [{ top: "{s}", bottom: "Pain" }, { top: "It really be like that", bottom: "{p}" }],
  sarcasm:   [{ top: "Oh sure", bottom: "{p}" }, { top: "{s}", bottom: "How very convincing" }],
  surprise:  [{ top: "EXCUSE ME", bottom: "{p}" }, { top: "{s}", bottom: "Did NOT see that coming" }],
  affection: [{ top: "{s}", bottom: "{p}" }, { top: "When they actually care", bottom: "{p}" }],
  fear:      [{ top: "That moment when", bottom: "{p}" }, { top: "{s}", bottom: "I'm in danger" }],
  disgust:   [{ top: "{s}", bottom: "Absolutely not" }, { top: "Me after reading this", bottom: "{p}" }],
  neutral:   [{ top: "{s}", bottom: "{p}" }, { top: "This conversation", bottom: "{p}" }],
};

function buildCaptions(hook, themes, keywords, messages, mood) {
  const primaryTheme = themes[0];
  const kw = keywords[0] || "this";

  // Choose the frame pool (theme-first, mood-fallback)
  let frames;
  if (primaryTheme && THEME_FRAMES[primaryTheme]) {
    frames = THEME_FRAMES[primaryTheme];
  } else {
    frames = MOOD_FRAMES[mood] || MOOD_FRAMES.neutral;
  }

  const frame = frames[Math.floor(Math.random() * frames.length)];

  // Resolve placeholders with actual conversation content
  const setup = hook.setup || fallbackSetup(messages);
  const punchline = hook.punchline || fallbackPunchline(messages);

  const fill = (t) =>
    cleanCaption(
      t.replace(/\{s\}/g, setup)
       .replace(/\{p\}/g, punchline)
       .replace(/\{k\}/g, kw)
    );

  return { top: fill(frame.top), bottom: fill(frame.bottom) };
}

function fallbackSetup(messages) {
  if (messages.length >= 2) {
    return truncate(conditionalSender(messages[messages.length - 2].text));
  }
  return "This conversation";
}

function fallbackPunchline(messages) {
  if (messages.length >= 1) {
    return truncate(conditionalSender(messages[messages.length - 1].text));
  }
  return "No words needed";
}

/* ────────────────────────────────────────────────────────────
 *  IMAGE URL RESOLUTION
 * ──────────────────────────────────────────────────────────── */

let _apiCache = null;

async function resolveImageUrl(templateId) {
  if (IMAGE_URLS[templateId]) return IMAGE_URLS[templateId];

  if (!_apiCache) {
    try {
      const res = await fetch("https://api.imgflip.com/get_memes");
      const data = await res.json();
      if (data.success) {
        _apiCache = {};
        for (const m of data.data.memes) _apiCache[m.id] = m.url;
      }
    } catch {
      _apiCache = {};
    }
  }
  return _apiCache?.[templateId] || null;
}

/* ────────────────────────────────────────────────────────────
 *  MAIN EXPORTS
 * ──────────────────────────────────────────────────────────── */

/**
 * Generate a meme from the analysis context.
 *
 * @param {object} memeContext  — from analyzer's buildMemeContext
 *   { mood, themes, keywords, messages, sentiment, tone, tones }
 * @param {string} conversationText — raw OCR / pasted text (used as last-resort)
 */
export async function generateMeme(memeContext, conversationText) {
  const {
    mood = "neutral",
    themes = [],
    keywords = [],
    messages = [],
  } = memeContext;

  // 1. Identify the comedic hook in the conversation
  const hook = identifyHook(messages, themes, mood);

  // 2. Select the best template (theme-first, mood-fallback)
  const template = selectTemplate(themes, mood);

  // 3. Build dynamic captions from the hook + themes — no filler
  const captions = buildCaptions(hook, themes, keywords, messages, mood);

  // 4. Resolve the real image URL
  const imageUrl = await resolveImageUrl(template.id);

  return {
    success: true,
    meme: {
      source: "template",
      template,
      captions,
      imageUrl,
      mood,
      hook: hook.type,
    },
  };
}

/**
 * Fetch trending memes from a free, CORS-enabled Reddit API.
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
