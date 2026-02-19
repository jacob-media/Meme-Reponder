import Sentiment from 'sentiment'

const sentiment = new Sentiment()

// Common slang words and phrases used by younger audiences
const SLANG_WORDS = [
  'lol', 'lmao', 'rofl', 'bruh', 'bro', 'dude', 'omg', 'tbh', 'ngl', 'fr', 'ong',
  'bet', 'cap', 'no cap', 'sus', 'slay', 'bussin', 'fire', 'lit', 'goat', 'goated',
  'mid', 'ratio', 'w', 'l', 'based', 'cringe', 'vibe', 'vibes', 'lowkey', 'highkey',
  'deadass', 'fam', 'sis', 'periodt', 'snatched', 'tea', 'spill', 'shade', 'extra',
  'salty', 'savage', 'flex', 'mood', 'same', 'big', 'yeet', 'simp', 'stan', 'ship',
  'ghosted', 'clout', 'drip', 'slaps', 'hits different', 'rent free', 'main character',
  'understood the assignment', 'ate', 'devoured', 'served', 'iconic', 'valid', 'real',
  'im dead', "i'm dead", 'crying', 'screaming', 'bestie', 'girly', 'bae', 'wya', 'wyd',
  'idk', 'idc', 'idgaf', 'smh', 'fomo', 'yolo', 'imo', 'rn', 'af', 'hmu', 'ttyl'
]

// Common topics/contexts
const TOPIC_KEYWORDS = {
  relationships: ['dating', 'boyfriend', 'girlfriend', 'crush', 'ex', 'love', 'heart', 'bae', 'couple', 'relationship', 'dm', 'flirt', 'talking stage'],
  school: ['homework', 'class', 'teacher', 'test', 'exam', 'grade', 'school', 'college', 'assignment', 'study', 'project', 'deadline'],
  gaming: ['game', 'play', 'win', 'lose', 'noob', 'gg', 'lag', 'stream', 'twitch', 'discord', 'squad', 'lobby', 'ranked'],
  drama: ['drama', 'beef', 'fight', 'mad', 'angry', 'blocked', 'unfollowed', 'exposed', 'cancelled', 'toxic', 'fake'],
  friendship: ['friend', 'bestie', 'group', 'chat', 'hangout', 'party', 'invited', 'left out', 'squad', 'crew'],
  family: ['mom', 'dad', 'parent', 'sibling', 'brother', 'sister', 'grounded', 'curfew', 'chores'],
  food: ['food', 'eat', 'hungry', 'snack', 'dinner', 'lunch', 'restaurant', 'order', 'delivery'],
  money: ['money', 'broke', 'pay', 'buy', 'expensive', 'cheap', 'sale', 'job', 'work'],
  social_media: ['post', 'story', 'reel', 'tiktok', 'instagram', 'snap', 'twitter', 'viral', 'follower', 'like']
}

// Username/timestamp patterns
const USERNAME_PATTERNS = [
  /^@[\w]+/,                           // @username
  /^[\w]+:/,                           // username:
  /^\[[\w\s]+\]/,                      // [username]
  /^<[\w\s]+>/,                        // <username>
]

const TIMESTAMP_PATTERNS = [
  /\d{1,2}:\d{2}\s*(am|pm)?/i,         // 12:30 PM, 9:45
  /\d{1,2}\/\d{1,2}(\/\d{2,4})?/,      // 12/25, 12/25/24
  /\d{1,2}-\d{1,2}(-\d{2,4})?/,        // 12-25, 12-25-24
  /today|yesterday|just now|now/i,
  /\d+\s*(min|hour|hr|day|week)s?\s*ago/i,
]

/**
 * Parse text to separate usernames, timestamps, and message content
 */
export function parseConversation(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const messages = []

  for (const line of lines) {
    let username = null
    let timestamp = null
    let content = line.trim()

    // Try to extract username
    for (const pattern of USERNAME_PATTERNS) {
      const match = content.match(pattern)
      if (match) {
        username = match[0].replace(/[@:\[\]<>]/g, '').trim()
        content = content.replace(pattern, '').trim()
        break
      }
    }

    // Try to extract timestamp
    for (const pattern of TIMESTAMP_PATTERNS) {
      const match = content.match(pattern)
      if (match) {
        timestamp = match[0]
        content = content.replace(pattern, '').trim()
        break
      }
    }

    // Clean up any remaining artifacts
    content = content.replace(/^[-:]\s*/, '').trim()

    if (content) {
      messages.push({ username, timestamp, content })
    }
  }

  return messages
}

/**
 * Analyze sentiment of text
 * Returns score from -5 (very negative) to 5 (very positive)
 */
export function analyzeSentiment(text) {
  const result = sentiment.analyze(text)
  
  // Normalize score to -5 to 5 range
  const normalizedScore = Math.max(-5, Math.min(5, result.score / 3))
  
  // Calculate percentage (0-100, where 50 is neutral)
  const percentage = ((normalizedScore + 5) / 10) * 100
  
  let label = 'Neutral'
  let emoji = '😐'
  
  if (normalizedScore > 2) {
    label = 'Very Positive'
    emoji = '😄'
  } else if (normalizedScore > 0.5) {
    label = 'Positive'
    emoji = '🙂'
  } else if (normalizedScore < -2) {
    label = 'Very Negative'
    emoji = '😠'
  } else if (normalizedScore < -0.5) {
    label = 'Negative'
    emoji = '😕'
  }

  return {
    score: normalizedScore,
    percentage,
    label,
    emoji,
    comparative: result.comparative,
    positiveWords: result.positive,
    negativeWords: result.negative
  }
}

/**
 * Analyze tone (Slang/Casual vs Formal)
 */
export function analyzeTone(text) {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  
  let slangCount = 0
  const foundSlang = []
  
  for (const slang of SLANG_WORDS) {
    if (lowerText.includes(slang)) {
      slangCount++
      foundSlang.push(slang)
    }
  }
  
  // Check for emoji-like text patterns
  const emojiPatterns = /[:;]-?[()DPp3]|xD|:3|<3|💀|😂|🤣|😭|🔥|💯|👀|😤|🙄|😒|🥺|👁️|✨/gi
  const emojiMatches = text.match(emojiPatterns) || []
  
  // Check for excessive punctuation (!!!, ???, etc.)
  const excessivePunctuation = text.match(/[!?]{2,}/g) || []
  
  // Check for ALL CAPS words
  const capsWords = text.match(/\b[A-Z]{2,}\b/g) || []
  
  const casualIndicators = slangCount + emojiMatches.length + excessivePunctuation.length + capsWords.length
  
  // Calculate slang percentage based on word count
  const slangPercentage = Math.min(100, (casualIndicators / Math.max(words.length, 1)) * 100 * 5)
  
  let tone = 'Formal'
  let description = 'Professional and proper'
  
  if (slangPercentage > 60) {
    tone = 'Super Casual'
    description = 'Very chill, lots of slang vibes'
  } else if (slangPercentage > 30) {
    tone = 'Casual'
    description = 'Relaxed and friendly'
  } else if (slangPercentage > 10) {
    tone = 'Semi-Casual'
    description = 'Mix of formal and casual'
  }

  return {
    tone,
    description,
    slangPercentage,
    foundSlang: [...new Set(foundSlang)].slice(0, 5),
    indicators: {
      slangCount,
      emojiCount: emojiMatches.length,
      capsCount: capsWords.length
    }
  }
}

/**
 * Detect main topic/context of conversation
 */
export function detectContext(text) {
  const lowerText = text.toLowerCase()
  const topicScores = {}
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0
    const matchedKeywords = []
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++
        matchedKeywords.push(keyword)
      }
    }
    
    if (score > 0) {
      topicScores[topic] = { score, keywords: matchedKeywords }
    }
  }
  
  // Sort topics by score
  const sortedTopics = Object.entries(topicScores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
  
  if (sortedTopics.length === 0) {
    return {
      primary: 'general',
      primaryLabel: 'General Chat',
      secondary: [],
      confidence: 'low'
    }
  }
  
  const topicLabels = {
    relationships: '💕 Relationships',
    school: '📚 School',
    gaming: '🎮 Gaming',
    drama: '🔥 Drama',
    friendship: '👯 Friendship',
    family: '👨‍👩‍👧 Family',
    food: '🍕 Food',
    money: '💰 Money',
    social_media: '📱 Social Media'
  }
  
  const primary = sortedTopics[0]
  const confidence = primary[1].score > 3 ? 'high' : primary[1].score > 1 ? 'medium' : 'low'
  
  return {
    primary: primary[0],
    primaryLabel: topicLabels[primary[0]] || primary[0],
    secondary: sortedTopics.slice(1).map(t => ({
      topic: t[0],
      label: topicLabels[t[0]] || t[0]
    })),
    confidence,
    matchedKeywords: primary[1].keywords
  }
}

/**
 * Generate meme search keywords based on analysis
 */
export function generateMemeKeywords(analysis) {
  const keywords = []
  
  // Add sentiment-based keywords
  if (analysis.sentiment.score > 2) {
    keywords.push('happy', 'excited', 'celebration', 'yes')
  } else if (analysis.sentiment.score > 0) {
    keywords.push('nice', 'good', 'cool', 'smile')
  } else if (analysis.sentiment.score < -2) {
    keywords.push('angry', 'frustrated', 'mad', 'rage')
  } else if (analysis.sentiment.score < 0) {
    keywords.push('annoyed', 'sad', 'disappointed', 'sigh')
  } else {
    keywords.push('reaction', 'mood', 'face')
  }
  
  // Add context-based keywords
  const contextKeywords = {
    relationships: ['love', 'couple', 'crush', 'dating'],
    school: ['study', 'homework', 'test', 'teacher'],
    gaming: ['gamer', 'gaming', 'win', 'lose'],
    drama: ['drama', 'tea', 'shocked', 'surprised'],
    friendship: ['friends', 'squad', 'bestie'],
    family: ['parents', 'family', 'mom', 'dad'],
    food: ['food', 'hungry', 'eating'],
    money: ['money', 'broke', 'rich'],
    social_media: ['viral', 'trending', 'post']
  }
  
  if (contextKeywords[analysis.context.primary]) {
    keywords.push(...contextKeywords[analysis.context.primary].slice(0, 2))
  }
  
  // Add tone-based keywords
  if (analysis.tone.slangPercentage > 50) {
    keywords.push('gen z', 'relatable', 'mood')
  }
  
  return [...new Set(keywords)].slice(0, 5)
}

/**
 * Full analysis pipeline
 */
export function analyzeText(text) {
  const parsed = parseConversation(text)
  const fullText = parsed.map(m => m.content).join(' ')
  
  const sentimentResult = analyzeSentiment(fullText)
  const toneResult = analyzeTone(fullText)
  const contextResult = detectContext(fullText)
  
  const analysis = {
    sentiment: sentimentResult,
    tone: toneResult,
    context: contextResult,
    parsed,
    originalText: text,
    wordCount: fullText.split(/\s+/).length,
    messageCount: parsed.length
  }
  
  analysis.memeKeywords = generateMemeKeywords(analysis)
  
  return analysis
}

/**
 * Generate suggested response text for custom meme
 */
export function generateResponseSuggestions(analysis) {
  const suggestions = []
  
  // Sentiment-based suggestions
  if (analysis.sentiment.score > 2) {
    suggestions.push("Let's gooo!", "W moment fr", "This is amazing!", "Can't stop smiling rn")
  } else if (analysis.sentiment.score > 0) {
    suggestions.push("That's pretty cool", "Valid", "I see you", "Nice nice")
  } else if (analysis.sentiment.score < -2) {
    suggestions.push("Bruh moment", "Not this again", "I can't even", "Pain.")
  } else if (analysis.sentiment.score < 0) {
    suggestions.push("That's rough", "Oof", "Yikes", "Hmm...")
  } else {
    suggestions.push("Interesting...", "Well then", "I see", "Ok ok")
  }
  
  // Context-specific suggestions
  if (analysis.context.primary === 'drama') {
    suggestions.push("The tea is PIPING hot", "And I oop-", "Not me watching this unfold")
  } else if (analysis.context.primary === 'relationships') {
    suggestions.push("The romance arc", "Main character energy", "This is so cute I'm dying")
  } else if (analysis.context.primary === 'school') {
    suggestions.push("The education system really said", "Teachers be like", "Student life hits different")
  }
  
  return [...new Set(suggestions)].slice(0, 6)
}

export default {
  parseConversation,
  analyzeSentiment,
  analyzeTone,
  detectContext,
  analyzeText,
  generateMemeKeywords,
  generateResponseSuggestions
}
