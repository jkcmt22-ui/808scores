import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkRateLimit,
  getRateLimitHeaders,
} from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  // Each test uses a unique prefix to avoid cross-test contamination
  let testCounter = 0
  const uniquePrefix = () => `test-${testCounter++}-${Date.now()}`

  it('allows the first request', () => {
    const result = checkRateLimit('user1', {
      limit: 5,
      windowMs: 60000,
      prefix: uniquePrefix(),
    })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.limit).toBe(5)
  })

  it('allows requests up to the limit', () => {
    const prefix = uniquePrefix()
    const config = { limit: 3, windowMs: 60000, prefix }

    const r1 = checkRateLimit('user1', config)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit('user1', config)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit('user1', config)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests beyond the limit', () => {
    const prefix = uniquePrefix()
    const config = { limit: 2, windowMs: 60000, prefix }

    checkRateLimit('user1', config)
    checkRateLimit('user1', config)

    const r3 = checkRateLimit('user1', config)
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
  })

  it('tracks different identifiers separately', () => {
    const prefix = uniquePrefix()
    const config = { limit: 1, windowMs: 60000, prefix }

    const r1 = checkRateLimit('userA', config)
    expect(r1.allowed).toBe(true)

    const r2 = checkRateLimit('userB', config)
    expect(r2.allowed).toBe(true)

    // userA is now blocked
    const r3 = checkRateLimit('userA', config)
    expect(r3.allowed).toBe(false)
  })

  it('resets after window expires', () => {
    const prefix = uniquePrefix()
    const config = { limit: 1, windowMs: 100, prefix } // 100ms window

    const r1 = checkRateLimit('user1', config)
    expect(r1.allowed).toBe(true)

    // Immediately blocked
    const r2 = checkRateLimit('user1', config)
    expect(r2.allowed).toBe(false)

    // Fast-forward time
    vi.useFakeTimers()
    vi.advanceTimersByTime(150)

    const r3 = checkRateLimit('user1', config)
    expect(r3.allowed).toBe(true)

    vi.useRealTimers()
  })

  it('returns resetIn time', () => {
    const prefix = uniquePrefix()
    const config = { limit: 5, windowMs: 60000, prefix }

    const result = checkRateLimit('user1', config)
    expect(result.resetIn).toBe(60000)
  })

  it('returns decreasing resetIn for blocked requests', () => {
    const prefix = uniquePrefix()
    const config = { limit: 1, windowMs: 60000, prefix }

    checkRateLimit('user1', config)
    const blocked = checkRateLimit('user1', config)

    expect(blocked.resetIn).toBeLessThanOrEqual(60000)
    expect(blocked.resetIn).toBeGreaterThan(0)
  })
})

describe('getRateLimitHeaders', () => {
  it('returns correct header format', () => {
    const headers = getRateLimitHeaders({
      allowed: true,
      remaining: 95,
      resetIn: 45000,
      limit: 100,
    })

    expect(headers['X-RateLimit-Limit']).toBe('100')
    expect(headers['X-RateLimit-Remaining']).toBe('95')
    expect(headers['X-RateLimit-Reset']).toBe('45') // 45000ms / 1000 = 45s
  })

  it('rounds reset time up', () => {
    const headers = getRateLimitHeaders({
      allowed: false,
      remaining: 0,
      resetIn: 1500, // 1.5 seconds
      limit: 10,
    })

    expect(headers['X-RateLimit-Reset']).toBe('2') // ceil(1.5) = 2
  })
})
