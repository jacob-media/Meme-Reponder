import Sentiment from "sentiment";
import nlp from "compromise";

const sentiment = new Sentiment();

/**
 * Comprehensive text analysis engine.
 * Analyzes sentiment, tone, emotion, themes, texting patterns, and more.
 */
export function analyzeConversation(ocrResult) {
  const { rawText, messages } = ocrResult;
  const fullText = messages.map((m) => m.text).join(" ");

  const sentimentResult = analyzeSentiment(fullText);
  const emotions = detectEmotions(fullText);
  const tone = detectTone(fullText, sentimentResult);
  const themes = extractThemes(fullText);
  const textingStyle = analyzeTextingStyle(messages);
  const inflection = detectInflection(fullText);
  const keywords = extractKeywords(fullText);

  return {
    sentiment: sentimentResult,
    emotions,
    tone,
    themes,
    textingStyle,
    inflection,
    keywords,
    summary: generateSummary(sentimentResult, emotions, tone, themes),
    memeContext: buildMemeContext(sentimentResult, emotions, tone, themes, keywords),
  };
}

/* ------------------------------------------------------------------ */
/*  Sentiment Analysis                                                 */
/* ------------------------------------------------------------------ */
function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  let label;
  if (result.comparative > 0.2) label = "very positive";
  else if (result.comparative > 0.05) label = "positive";
  else if (result.comparative > -0.05) label = "neutral";
  else if (result.comparative > -0.2) label = "negative";
  else label = "very negative";

  return {
    score: result.score,
    comparative: result.comparative,
    label,
    positive: result.positive,
    negative: result.negative,
  };
}

/* ------------------------------------------------------------------ */
/*  Emotion Detection                                                  */
/* ------------------------------------------------------------------ */
function detectEmotions(text) {
  const lower = text.toLowerCase();
  const emotionLexicon = {
    joy: [
      "happy", "glad", "love", "amazing", "awesome", "great", "wonderful",
      "fantastic", "excellent", "beautiful", "excited", "yay", "lol", "haha",
      "😂", "😊", "❤️", "🥰", "😍", "celebrate", "fun", "enjoy",
    ],
    anger: [
      "angry", "mad", "furious", "hate", "annoyed", "frustrated", "pissed",
      "ugh", "wtf", "stupid", "idiot", "rage", "disgusting", "horrible",
      "😡", "🤬", "damn", "hell",
    ],
    sadness: [
      "sad", "depressed", "cry", "tears", "miss", "lonely", "heartbroken",
      "sorry", "disappointed", "unfortunately", "😢", "😭", "💔", "sigh",
      "upset",
    ],
    fear: [
      "scared", "afraid", "worried", "anxious", "nervous", "panic",
      "terrified", "creepy", "scary", "fear", "😰", "😨", "😱", "help",
    ],
    surprise: [
      "wow", "omg", "no way", "really", "seriously", "what", "unexpected",
      "shocked", "unbelievable", "😮", "😲", "🤯", "surprise", "whoa",
    ],
    disgust: [
      "gross", "eww", "disgusting", "nasty", "yuck", "terrible", "awful",
      "🤢", "🤮", "cringe", "icky",
    ],
    sarcasm: [
      "sure", "right", "yeah right", "totally", "obviously", "of course",
      "wow how surprising", "great job", "genius", "brilliant", "🙄",
      "whatever",
    ],
    affection: [
      "love you", "miss you", "babe", "baby", "honey", "sweetheart", "cutie",
      "😘", "💕", "💗", "xo", "muah", "hugs", "kisses",
    ],
  };

  const scores = {};
  for (const [emotion, words] of Object.entries(emotionLexicon)) {
    let count = 0;
    for (const word of words) {
      const regex = new RegExp(escapeRegex(word), "gi");
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    }
    scores[emotion] = count;
  }

  // Normalize scores
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalized = {};
  for (const [emotion, score] of Object.entries(scores)) {
    normalized[emotion] = Math.round((score / maxScore) * 100);
  }

  // Find dominant emotion
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return {
    scores: normalized,
    dominant: dominant[1] > 0 ? dominant[0] : "neutral",
    raw: scores,
  };
}

/* ------------------------------------------------------------------ */
/*  Tone Detection                                                     */
/* ------------------------------------------------------------------ */
function detectTone(text, sentimentResult) {
  const lower = text.toLowerCase();
  const tones = [];

  // Formal vs casual
  const casualIndicators = ["lol", "lmao", "bruh", "nah", "ya", "gonna", "wanna", "idk", "tbh", "ngl", "fr", "imo"];
  const formalIndicators = ["however", "therefore", "regarding", "sincerely", "appreciate", "unfortunately"];
  const casualCount = casualIndicators.filter((w) => lower.includes(w)).length;
  const formalCount = formalIndicators.filter((w) => lower.includes(w)).length;
  tones.push(casualCount > formalCount ? "casual" : formalCount > 0 ? "formal" : "conversational");

  // Urgency
  if (/!{2,}|asap|urgent|hurry|now|immediately|quick/i.test(text)) {
    tones.push("urgent");
  }

  // Playful
  if (/haha|lol|lmao|😂|🤣|jk|kidding|joking/i.test(text)) {
    tones.push("playful");
  }

  // Passive-aggressive
  if (/k\.|fine\.|whatever|sure\.|okay\.|👍$/i.test(text)) {
    tones.push("passive-aggressive");
  }

  // Flirty
  if (/😏|😘|😍|🥰|💋|👀|cutie|hottie|babe|gorgeous/i.test(text)) {
    tones.push("flirty");
  }

  // Dry/deadpan
  if (sentimentResult.label === "neutral" && text.length < 50) {
    tones.push("dry");
  }

  return tones.length > 0 ? tones : ["neutral"];
}

/* ------------------------------------------------------------------ */
/*  Theme Extraction                                                   */
/* ------------------------------------------------------------------ */
function extractThemes(text) {
  const doc = nlp(text);
  const themes = [];

  // Extract topics using compromise NLP
  const topics = doc.topics().out("array");
  themes.push(...topics.slice(0, 5));

  // Detect common messaging themes
  const themePatterns = {
    "making plans":  /\b(meet|hang|plan|going|when|where|come over|let's|wanna|want to)\b/i,
    "relationship":  /\b(love|dating|boyfriend|girlfriend|babe|baby|miss you|together)\b/i,
    "work/school":   /\b(work|job|boss|class|homework|exam|meeting|deadline|project)\b/i,
    "food":          /\b(eat|food|dinner|lunch|breakfast|hungry|restaurant|cook|pizza)\b/i,
    "gossip":        /\b(did you hear|guess what|omg|no way|tell me|secret|drama)\b/i,
    "argument":      /\b(wrong|fault|can't believe|why did you|stop|leave me|done)\b/i,
    "apology":       /\b(sorry|apologize|my bad|forgive|didn't mean|mistake)\b/i,
    "celebration":   /\b(congrats|birthday|party|celebrate|cheers|woohoo|achievement)\b/i,
    "support":       /\b(here for you|it's okay|don't worry|you got this|stay strong)\b/i,
    "humor":         /\b(joke|funny|hilarious|lmao|dead|i can't|bruh)\b/i,
  };

  for (const [theme, pattern] of Object.entries(themePatterns)) {
    if (pattern.test(text)) themes.push(theme);
  }

  return [...new Set(themes)];
}

/* ------------------------------------------------------------------ */
/*  Texting Style Analysis                                             */
/* ------------------------------------------------------------------ */
function analyzeTextingStyle(messages) {
  const texts = messages.map((m) => m.text);
  const avgLength = texts.reduce((sum, t) => sum + t.length, 0) / (texts.length || 1);
  const usesEmojis = texts.some((t) => /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(t));
  const usesSlang = texts.some((t) => /\b(lol|lmao|bruh|fr|ngl|tbh|idk|omg|smh|fml|imo)\b/i.test(t));
  const usesCaps = texts.some((t) => /[A-Z]{3,}/.test(t));
  const usesExclamation = texts.some((t) => /!/.test(t));
  const usesQuestionMarks = texts.some((t) => /\?/.test(t));

  let style;
  if (avgLength < 20) style = "short texter";
  else if (avgLength < 60) style = "moderate texter";
  else style = "paragraph texter";

  return {
    averageMessageLength: Math.round(avgLength),
    messageCount: messages.length,
    style,
    usesEmojis,
    usesSlang,
    usesCaps,
    usesExclamation,
    usesQuestionMarks,
    energy: usesCaps || usesExclamation ? "high" : "low",
  };
}

/* ------------------------------------------------------------------ */
/*  Inflection Detection                                               */
/* ------------------------------------------------------------------ */
function detectInflection(text) {
  const inflections = [];
  if (/\?{2,}/.test(text)) inflections.push("confused/emphatic questioning");
  else if (/\?/.test(text)) inflections.push("questioning");
  if (/!{2,}/.test(text)) inflections.push("shouting/excitement");
  else if (/!/.test(text)) inflections.push("emphatic");
  if (/\.{3,}/.test(text)) inflections.push("trailing off / hesitant");
  if (/[A-Z]{3,}/.test(text)) inflections.push("yelling / emphasizing");
  if (/~+/.test(text)) inflections.push("playful / sing-song");
  if (/\b(um|uh|hmm|well)\b/i.test(text)) inflections.push("uncertain / thinking");
  return inflections.length > 0 ? inflections : ["neutral / flat"];
}

/* ------------------------------------------------------------------ */
/*  Keyword Extraction                                                 */
/* ------------------------------------------------------------------ */
function extractKeywords(text) {
  const doc = nlp(text);
  const nouns = doc.nouns().out("array");
  const verbs = doc.verbs().out("array");
  const adjectives = doc.adjectives().out("array");
  return {
    nouns: [...new Set(nouns)].slice(0, 10),
    verbs: [...new Set(verbs)].slice(0, 10),
    adjectives: [...new Set(adjectives)].slice(0, 10),
    all: [...new Set([...nouns, ...verbs, ...adjectives])].slice(0, 15),
  };
}

/* ------------------------------------------------------------------ */
/*  Summary & Meme Context                                             */
/* ------------------------------------------------------------------ */
function generateSummary(sentiment, emotions, tone, themes) {
  const parts = [];
  parts.push(`The conversation has a ${sentiment.label} sentiment.`);
  if (emotions.dominant !== "neutral") {
    parts.push(`The dominant emotion is ${emotions.dominant}.`);
  }
  parts.push(`The tone is ${tone.join(", ")}.`);
  if (themes.length > 0) {
    parts.push(`Key themes: ${themes.join(", ")}.`);
  }
  return parts.join(" ");
}

function buildMemeContext(sentiment, emotions, tone, themes, keywords) {
  // Build a rich search query for meme APIs
  const parts = [];
  if (emotions.dominant !== "neutral") parts.push(emotions.dominant);
  parts.push(...tone.slice(0, 2));
  parts.push(...themes.slice(0, 2));
  parts.push(...keywords.all.slice(0, 3));
  return {
    searchQuery: parts.join(" "),
    mood: emotions.dominant,
    sentiment: sentiment.label,
    tone: tone[0],
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
