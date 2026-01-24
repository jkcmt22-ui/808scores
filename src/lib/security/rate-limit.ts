/**
 * Client-side rate limiting utilities
 * Works in conjunction with server-side enforcement
 */

import { createClient } from '@/lib/supabase/client'

export type RateLimitAction =
  | 'login_attempt'
  | 'signup'
  | 'chat_message'
  | 'chat_like'
  | 'raffle_entry'
  | 'point_earning'
  | 'password_reset'

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  currentCount?: number
  maxAllowed?: number
  retryAfterSeconds?: number
  requireCaptcha?: boolean
}

/**
 * Check rate limit before performing an action
 * This calls the server-side function
 */
export async function checkRateLimit(
  action: RateLimitAction,
  userId?: string
): Promise<RateLimitResult> {
  const supabase = createClient()
  if (!supabase) {
    return { allowed: true } // Allow if no client
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('check_rate_limit', {
      p_user_id: userId || null,
      p_ip_address: null, // Server will get the real IP
      p_action_type: action,
    })

    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true } // Allow on error (fail open)
    }

    return data as RateLimitResult
  } catch (err) {
    console.error('Rate limit check exception:', err)
    return { allowed: true }
  }
}

/**
 * Client-side rate limiting (for immediate feedback)
 * This is a soft limit - the server still enforces the real limit
 */
const clientRateLimits: Map<string, { count: number; resetAt: number }> = new Map()

const CLIENT_LIMITS: Record<RateLimitAction, { windowMs: number; maxRequests: number }> = {
  login_attempt: { windowMs: 60000, maxRequests: 5 },
  signup: { windowMs: 60000, maxRequests: 2 },
  chat_message: { windowMs: 10000, maxRequests: 5 },
  chat_like: { windowMs: 10000, maxRequests: 10 },
  raffle_entry: { windowMs: 60000, maxRequests: 3 },
  point_earning: { windowMs: 60000, maxRequests: 20 },
  password_reset: { windowMs: 300000, maxRequests: 3 },
}

/**
 * Check client-side rate limit (instant, no network call)
 */
export function checkClientRateLimit(action: RateLimitAction): boolean {
  const config = CLIENT_LIMITS[action]
  if (!config) return true

  const key = action
  const now = Date.now()
  const existing = clientRateLimits.get(key)

  if (!existing || now > existing.resetAt) {
    // Window expired, reset
    clientRateLimits.set(key, { count: 1, resetAt: now + config.windowMs })
    return true
  }

  if (existing.count >= config.maxRequests) {
    return false
  }

  existing.count++
  return true
}

/**
 * Record an action for client-side rate limiting
 */
export function recordClientAction(action: RateLimitAction): void {
  checkClientRateLimit(action) // This increments the counter
}

/**
 * Get time until rate limit resets
 */
export function getTimeUntilReset(action: RateLimitAction): number {
  const existing = clientRateLimits.get(action)
  if (!existing) return 0

  const remaining = existing.resetAt - Date.now()
  return Math.max(0, remaining)
}
