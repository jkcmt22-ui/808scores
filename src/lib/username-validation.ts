// Username validation with profanity filter
import { Filter } from 'bad-words'

// Initialize the profanity filter
const filter = new Filter()

// Add custom words to block (Hawaii-specific slurs and inappropriate terms)
filter.addWords(
  'haole', // Can be derogatory in certain contexts
  'popolo', // Derogatory term
  'pake' // Can be derogatory
)

// Username constraints
const MIN_LENGTH = 3
const MAX_LENGTH = 20
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

export interface UsernameValidationResult {
  valid: boolean
  error?: string
}

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'mod',
  'moderator',
  'support',
  'help',
  'hawaiisportscenter',
  'official',
  'staff',
  'team',
  'system',
  'root',
  'null',
  'undefined',
  'api',
  'www',
  'mail',
  'email',
  'test',
  'user',
  'guest',
  'anonymous',
])

export function validateUsername(username: string): UsernameValidationResult {
  // Trim whitespace
  const trimmed = username.trim()

  // Check minimum length
  if (trimmed.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Username must be at least ${MIN_LENGTH} characters`,
    }
  }

  // Check maximum length
  if (trimmed.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Username must be no more than ${MAX_LENGTH} characters`,
    }
  }

  // Check for valid characters (alphanumeric and underscores only)
  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    }
  }

  // Check for reserved usernames
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: 'This username is reserved',
    }
  }

  // Check for profanity
  if (filter.isProfane(trimmed)) {
    return {
      valid: false,
      error: 'Username contains inappropriate language',
    }
  }

  // Check for profanity with spaces (catches compound words)
  const withSpaces = trimmed.replace(/_/g, ' ')
  if (filter.isProfane(withSpaces)) {
    return {
      valid: false,
      error: 'Username contains inappropriate language',
    }
  }

  return { valid: true }
}

// Clean a username (remove profanity, keep structure)
export function sanitizeUsername(username: string): string {
  return filter.clean(username)
}
