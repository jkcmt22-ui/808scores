import { describe, it, expect, beforeEach } from 'vitest'
import {
  containsProfanity,
  isSpam,
  validateMessage,
  censorText,
  shouldAutoHide,
} from '@/lib/content-filter'

describe('containsProfanity', () => {
  it('detects basic profanity', () => {
    expect(containsProfanity('what the fuck')).toBe(true)
    expect(containsProfanity('this is shit')).toBe(true)
    expect(containsProfanity('you are an asshole')).toBe(true)
  })

  it('detects l33t speak variations', () => {
    expect(containsProfanity('what the fck')).toBe(true)
    expect(containsProfanity('sh1t')).toBe(true)
    expect(containsProfanity('a55hole')).toBe(true)
  })

  it('detects spaced out profanity', () => {
    expect(containsProfanity('f u c k')).toBe(true)
    expect(containsProfanity('s.h.i.t')).toBe(true)
  })

  it('allows clean messages', () => {
    expect(containsProfanity('Great game tonight!')).toBe(false)
    expect(containsProfanity('Go Warriors!')).toBe(false)
    expect(containsProfanity('What a play!')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(containsProfanity('FUCK this')).toBe(true)
    expect(containsProfanity('what the Fuck')).toBe(true)
  })
})

describe('isSpam', () => {
  it('detects repeated characters', () => {
    expect(isSpam('helloooooo')).toBe(true)
    expect(isSpam('AAAAAAAAA')).toBe(true)
  })

  it('detects URLs', () => {
    // URLs are detected by the spam filter
    expect(isSpam('Check out https://spam.com for deals')).toBe(true)
  })

  it('detects excessive caps (10+ consecutive)', () => {
    // Pattern requires 10+ consecutive caps
    expect(isSpam('AAAAAAAAAA')).toBe(true)
    expect(isSpam('VERYLONGCAPS')).toBe(true)
  })

  it('allows normal messages', () => {
    expect(isSpam('Great game!')).toBe(false)
    expect(isSpam('Go team!')).toBe(false)
    expect(isSpam('Nice shot!')).toBe(false)
  })
})

describe('validateMessage', () => {
  const testUserId = 'test-user-123'

  it('rejects empty messages', () => {
    const result = validateMessage('', testUserId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('empty')
  })

  it('rejects whitespace-only messages', () => {
    const result = validateMessage('   ', testUserId)
    expect(result.valid).toBe(false)
  })

  it('rejects messages over 280 characters', () => {
    const longMessage = 'a'.repeat(281)
    const result = validateMessage(longMessage, testUserId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('too long')
  })

  it('rejects messages with profanity', () => {
    // Use a fresh string to avoid regex lastIndex issues
    const result = validateMessage('this is some bullshit', testUserId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('respectful')
  })

  it('rejects spam messages', () => {
    const result = validateMessage('Check out https://spam.com for free stuff!', testUserId)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('spam')
  })

  it('accepts valid messages', () => {
    const result = validateMessage('Great game tonight!', testUserId)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

describe('censorText', () => {
  it('replaces profanity with asterisks', () => {
    const censored = censorText('what the fuck')
    expect(censored).not.toContain('fuck')
    expect(censored).toContain('****')
  })

  it('preserves clean text', () => {
    const text = 'Great game!'
    expect(censorText(text)).toBe(text)
  })
})

describe('shouldAutoHide', () => {
  it('returns true for 10+ reports', () => {
    expect(shouldAutoHide(10, 0)).toBe(true)
    expect(shouldAutoHide(15, 100)).toBe(true)
  })

  it('returns true for 3+ reports within 10 minutes', () => {
    expect(shouldAutoHide(3, 5)).toBe(true)
    expect(shouldAutoHide(4, 8)).toBe(true)
  })

  it('returns true for 5+ reports within an hour', () => {
    expect(shouldAutoHide(5, 30)).toBe(true)
    expect(shouldAutoHide(6, 45)).toBe(true)
  })

  it('returns false for low report counts', () => {
    expect(shouldAutoHide(1, 5)).toBe(false)
    expect(shouldAutoHide(2, 30)).toBe(false)
  })

  it('returns false for old messages with moderate reports', () => {
    expect(shouldAutoHide(4, 120)).toBe(false) // 4 reports after 2 hours
  })
})
