/**
 * Comprehensive content filter for chat moderation
 * Handles profanity, spam, and inappropriate content
 */

// Comprehensive profanity word list (lowercase)
// This list includes common profanity and slurs that should be blocked
const PROFANITY_WORDS = [
  // Common profanity
  'fuck', 'fucker', 'fucking', 'fucked', 'fck', 'fuk', 'fuq',
  'shit', 'shitting', 'shitty', 'bullshit', 'sh1t', 'sht',
  'ass', 'asshole', 'asses', 'a55', 'azz',
  'bitch', 'bitches', 'b1tch', 'biatch',
  'bastard', 'bastards',
  'damn', 'dammit', 'goddamn',
  'crap', 'crappy',
  'hell',
  'dick', 'dicks', 'd1ck',
  'cock', 'cocks', 'c0ck',
  'pussy', 'pussies', 'pu55y',
  'cunt', 'cunts',
  'whore', 'whores', 'wh0re',
  'slut', 'sluts',
  'piss', 'pissed', 'pissing',
  'douche', 'douchebag',
  'twat',
  'tits', 'titties', 't1ts',
  'boob', 'boobs',
  'fag', 'faggot', 'fags', 'f4g',
  'homo',
  'retard', 'retarded', 'tard',
  'nigger', 'nigga', 'n1gger', 'n1gga', 'nigg3r',
  'chink',
  'spic', 'spick',
  'kike',
  'wetback',
  'cracker',
  'honky',
  'gook',
  'jap',
  'beaner',
  // Sexual content
  'blowjob', 'handjob', 'cumshot', 'creampie',
  'orgasm', 'horny', 'porn', 'porno', 'xxx',
  'dildo', 'vibrator',
  'masturbate', 'masturbation', 'jerkoff', 'jackoff',
  'erection', 'boner',
  'anal', 'anus',
  'testicle', 'testicles', 'ballsack', 'nutsack',
  'penis', 'vagina', 'clitoris',
  // Violence
  'kill', 'murder', 'rape', 'rapist',
  // Drug references
  'cocaine', 'heroin', 'meth', 'crack',
]

// L33t speak substitutions
const LEET_MAP: Record<string, string[]> = {
  'a': ['4', '@', 'α'],
  'b': ['8', '|3'],
  'c': ['(', '<', 'ç'],
  'e': ['3', '€'],
  'g': ['6', '9'],
  'h': ['#'],
  'i': ['1', '!', '|', 'í'],
  'l': ['1', '|', '7'],
  'o': ['0', 'ø', 'ο'],
  's': ['5', '$', 'z'],
  't': ['7', '+'],
  'u': ['μ', 'υ'],
  'x': ['×'],
  'z': ['2'],
}

// Escape special regex characters
function escapeRegexChar(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Build regex pattern that matches l33t speak variations
function buildProfanityRegex(word: string): RegExp {
  let pattern = ''
  for (const char of word.toLowerCase()) {
    const alternatives = LEET_MAP[char]
    if (alternatives) {
      // Match the character or any of its l33t alternatives
      // Escape special characters in the character class
      const escapedAlts = alternatives.map(a => escapeRegexChar(a)).join('')
      pattern += `[${escapeRegexChar(char)}${escapedAlts}]`
    } else {
      // Escape the character if it's a special regex char
      pattern += escapeRegexChar(char)
    }
    // Allow optional spaces, dots, dashes between characters (to catch "f u c k")
    pattern += '[\\s._-]*'
  }
  // Remove trailing separator pattern
  pattern = pattern.replace(/\[\\s\._-\]\*$/, '')
  return new RegExp(pattern, 'gi')
}

// Pre-build regex patterns for all profanity words
const PROFANITY_PATTERNS = PROFANITY_WORDS.map(word => ({
  word,
  regex: buildProfanityRegex(word),
}))

// Spam patterns
const SPAM_PATTERNS = [
  /(.)\1{4,}/gi, // Same character repeated 5+ times
  /(..+)\1{3,}/gi, // Same pattern repeated 4+ times
  /https?:\/\/[^\s]+/gi, // URLs
  /[A-Z]{10,}/g, // All caps 10+ characters
  /\b(buy|sell|discount|free|click|visit|check out)\b.*\b(link|site|website|store)\b/gi, // Spam phrases
]

// Rate limit tracking (in-memory, resets on deploy)
const userMessageTimes: Map<string, number[]> = new Map()
const MAX_MESSAGES_PER_MINUTE = 10

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  // Normalize text: remove extra spaces, convert to lowercase
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim()

  // Check against all profanity patterns
  for (const { regex } of PROFANITY_PATTERNS) {
    if (regex.test(normalizedText)) {
      return true
    }
    // Reset regex lastIndex
    regex.lastIndex = 0
  }

  return false
}

/**
 * Check if text appears to be spam
 */
export function isSpam(text: string): boolean {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return true
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0
  }
  return false
}

/**
 * Check if user is sending messages too fast
 */
export function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const userTimes = userMessageTimes.get(userId) || []

  // Filter to only messages in the last minute
  const recentMessages = userTimes.filter(time => now - time < 60000)

  // Update the map
  userMessageTimes.set(userId, recentMessages)

  return recentMessages.length >= MAX_MESSAGES_PER_MINUTE
}

/**
 * Record a message time for rate limiting
 */
export function recordMessage(userId: string): void {
  const now = Date.now()
  const userTimes = userMessageTimes.get(userId) || []
  userTimes.push(now)
  userMessageTimes.set(userId, userTimes)
}

/**
 * Clean text by replacing profanity with asterisks (for display)
 */
export function censorText(text: string): string {
  let censored = text

  for (const { regex, word } of PROFANITY_PATTERNS) {
    censored = censored.replace(regex, '*'.repeat(word.length))
    regex.lastIndex = 0
  }

  return censored
}

/**
 * Validate a chat message
 * Returns { valid: boolean, error?: string }
 */
export function validateMessage(
  text: string,
  userId: string
): { valid: boolean; error?: string } {
  // Check length
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (text.length > 280) {
    return { valid: false, error: 'Message too long (max 280 characters)' }
  }

  // Check for profanity
  if (containsProfanity(text)) {
    return { valid: false, error: 'Please keep the chat respectful' }
  }

  // Check for spam patterns
  if (isSpam(text)) {
    return { valid: false, error: 'This message looks like spam' }
  }

  // Check rate limiting
  if (isRateLimited(userId)) {
    return { valid: false, error: 'Slow down! Too many messages' }
  }

  return { valid: true }
}

/**
 * Calculate if a message should be auto-hidden based on reports
 */
export function shouldAutoHide(reportCount: number, messageAgeMinutes: number): boolean {
  // Auto-hide if:
  // - 3+ reports within first 10 minutes
  // - 5+ reports within first hour
  // - 10+ reports ever
  if (reportCount >= 10) return true
  if (messageAgeMinutes <= 10 && reportCount >= 3) return true
  if (messageAgeMinutes <= 60 && reportCount >= 5) return true
  return false
}
