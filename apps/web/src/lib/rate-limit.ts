/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store - resets on serverless function cold starts
// This is acceptable for basic protection; use Redis for persistent rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically (every 5 minutes)
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  
  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
  /** Unique identifier prefix for this limiter (e.g., 'api', 'submit', 'search') */
  prefix?: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of requests remaining in current window */
  remaining: number
  /** Time in ms until the rate limit resets */
  resetIn: number
  /** Total limit for this window */
  limit: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries()

  const { limit, windowMs, prefix = 'default' } = config
  const key = `${prefix}:${identifier}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  // New entry or expired window
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      allowed: true,
      remaining: limit - 1,
      resetIn: windowMs,
      limit,
    }
  }

  // Within window, check count
  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      limit,
    }
  }

  // Increment and allow
  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetIn: entry.resetTime - now,
    limit,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
  }
}

// Pre-configured rate limiters for common use cases

/** General API rate limit: 100 requests per minute */
export const apiRateLimit = (identifier: string) =>
  checkRateLimit(identifier, { limit: 100, windowMs: 60 * 1000, prefix: 'api' })

/** Score submission rate limit: 10 per minute (generous for live updates) */
export const submitRateLimit = (identifier: string) =>
  checkRateLimit(identifier, { limit: 10, windowMs: 60 * 1000, prefix: 'submit' })

/** Search rate limit: 30 per minute */
export const searchRateLimit = (identifier: string) =>
  checkRateLimit(identifier, { limit: 30, windowMs: 60 * 1000, prefix: 'search' })

/** Chat message rate limit: 20 per minute */
export const chatRateLimit = (identifier: string) =>
  checkRateLimit(identifier, { limit: 20, windowMs: 60 * 1000, prefix: 'chat' })

/** Auth attempts rate limit: 5 per 15 minutes */
export const authRateLimit = (identifier: string) =>
  checkRateLimit(identifier, { limit: 5, windowMs: 15 * 60 * 1000, prefix: 'auth' })
