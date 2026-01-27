import { describe, it, expect } from 'vitest'
import { validateUsername } from '@/lib/username-validation'

describe('validateUsername', () => {
  describe('length validation', () => {
    it('rejects usernames shorter than 3 characters', () => {
      const result = validateUsername('ab')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('at least 3')
    })

    it('rejects usernames longer than 20 characters', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no more than 20')
    })

    it('accepts usernames between 3 and 20 characters', () => {
      expect(validateUsername('abc').valid).toBe(true)
      expect(validateUsername('a'.repeat(20)).valid).toBe(true)
    })
  })

  describe('character validation', () => {
    it('accepts alphanumeric characters', () => {
      expect(validateUsername('user123').valid).toBe(true)
      expect(validateUsername('TestUser').valid).toBe(true)
    })

    it('accepts underscores', () => {
      expect(validateUsername('user_name').valid).toBe(true)
      expect(validateUsername('_username_').valid).toBe(true)
    })

    it('rejects special characters', () => {
      expect(validateUsername('user@name').valid).toBe(false)
      expect(validateUsername('user-name').valid).toBe(false)
      expect(validateUsername('user.name').valid).toBe(false)
      expect(validateUsername('user name').valid).toBe(false)
    })

    it('provides helpful error for invalid characters', () => {
      const result = validateUsername('user@name')
      expect(result.error).toContain('letters, numbers, and underscores')
    })
  })

  describe('reserved usernames', () => {
    it('rejects reserved usernames', () => {
      expect(validateUsername('admin').valid).toBe(false)
      expect(validateUsername('moderator').valid).toBe(false)
      expect(validateUsername('support').valid).toBe(false)
      expect(validateUsername('official').valid).toBe(false)
    })

    it('is case insensitive for reserved names', () => {
      expect(validateUsername('ADMIN').valid).toBe(false)
      expect(validateUsername('Admin').valid).toBe(false)
    })

    it('provides helpful error for reserved names', () => {
      const result = validateUsername('admin')
      expect(result.error).toContain('reserved')
    })
  })

  describe('profanity filter', () => {
    it('rejects usernames containing profanity', () => {
      expect(validateUsername('fuck_user').valid).toBe(false)
      expect(validateUsername('user_shit').valid).toBe(false)
    })

    it('detects profanity in compound words', () => {
      // Using underscores that become spaces
      expect(validateUsername('bad_ass_user').valid).toBe(false)
    })

    it('provides helpful error for profanity', () => {
      const result = validateUsername('fuck_user')
      expect(result.error).toContain('inappropriate')
    })
  })

  describe('valid usernames', () => {
    it('accepts typical valid usernames', () => {
      expect(validateUsername('john_doe').valid).toBe(true)
      expect(validateUsername('player123').valid).toBe(true)
      expect(validateUsername('HawaiiSports').valid).toBe(true)
      expect(validateUsername('GoWarriors808').valid).toBe(true)
    })
  })

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      expect(validateUsername('  validuser  ').valid).toBe(true)
    })
  })
})
