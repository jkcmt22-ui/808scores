import { describe, it, expect } from 'vitest'
import { getSafeRedirectUrl } from '@/lib/utils'

describe('getSafeRedirectUrl', () => {
  describe('valid redirects', () => {
    it('allows relative paths starting with /', () => {
      expect(getSafeRedirectUrl('/profile')).toBe('/profile')
      expect(getSafeRedirectUrl('/game/123')).toBe('/game/123')
      expect(getSafeRedirectUrl('/admin/dashboard')).toBe('/admin/dashboard')
    })

    it('allows paths with query strings', () => {
      expect(getSafeRedirectUrl('/search?q=test')).toBe('/search?q=test')
      expect(getSafeRedirectUrl('/game/123?tab=chat')).toBe('/game/123?tab=chat')
    })

    it('allows paths with fragments', () => {
      expect(getSafeRedirectUrl('/docs#section1')).toBe('/docs#section1')
    })

    it('returns the root path for null/undefined input', () => {
      expect(getSafeRedirectUrl(null)).toBe('/')
      expect(getSafeRedirectUrl(undefined as unknown as string)).toBe('/')
    })
  })

  describe('malicious redirects blocked', () => {
    it('blocks absolute URLs', () => {
      expect(getSafeRedirectUrl('https://evil.com')).toBe('/')
      expect(getSafeRedirectUrl('http://malicious.com/steal')).toBe('/')
      expect(getSafeRedirectUrl('https://evil.com/fake-login')).toBe('/')
    })

    it('blocks protocol-relative URLs', () => {
      expect(getSafeRedirectUrl('//evil.com')).toBe('/')
      expect(getSafeRedirectUrl('//evil.com/phishing')).toBe('/')
    })

    it('blocks javascript: URLs', () => {
      expect(getSafeRedirectUrl('/test?next=javascript:alert(1)')).toBe('/')
      expect(getSafeRedirectUrl('javascript:alert(document.cookie)')).toBe('/')
      expect(getSafeRedirectUrl('JAVASCRIPT:alert(1)')).toBe('/')
    })

    it('blocks data: URLs', () => {
      expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('/')
      expect(getSafeRedirectUrl('DATA:text/html,attack')).toBe('/')
    })

    it('blocks URL-encoded attacks', () => {
      // Double slash encoded
      expect(getSafeRedirectUrl('/%2F/evil.com')).toBe('/')
      // Protocol encoded
      expect(getSafeRedirectUrl('/%68%74%74%70%73://evil.com')).toBe('/')
    })

    it('handles empty strings', () => {
      expect(getSafeRedirectUrl('')).toBe('/')
    })

    it('trims whitespace', () => {
      expect(getSafeRedirectUrl('  /profile  ')).toBe('/profile')
    })
  })

  describe('custom fallback', () => {
    it('uses custom fallback when provided', () => {
      expect(getSafeRedirectUrl(null, '/home')).toBe('/home')
      expect(getSafeRedirectUrl('https://evil.com', '/dashboard')).toBe('/dashboard')
    })
  })
})
