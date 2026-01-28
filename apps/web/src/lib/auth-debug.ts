/**
 * Auth debugging utilities (dev-only)
 * Tracks auth subscriptions, profile fetches, and helps diagnose state issues
 */

const isDev = process.env.NODE_ENV === 'development'

// Track active auth subscriptions
let authSubscriptionCount = 0
const authSubscriptions: Map<string, { createdAt: number; source: string }> = new Map()

// Track profile fetches
interface ProfileFetch {
  timestamp: number
  duration: number
  userId: string
  source: string
  query: string
  success: boolean
}
const profileFetches: ProfileFetch[] = []
const MAX_FETCH_HISTORY = 50

/**
 * Log and track auth subscription creation
 */
export function trackAuthSubscription(source: string): string {
  if (!isDev) return ''

  const id = `${source}-${Date.now()}`
  authSubscriptionCount++
  authSubscriptions.set(id, { createdAt: Date.now(), source })

  console.log(
    `%c[AUTH-DEBUG] Subscription created: ${source}`,
    'color: #00ff88; font-weight: bold',
    `\n  Total active: ${authSubscriptionCount}`,
    `\n  ID: ${id}`
  )

  if (authSubscriptionCount > 1) {
    console.warn(
      `%c[AUTH-DEBUG] WARNING: Multiple auth subscriptions detected (${authSubscriptionCount})`,
      'color: #ff6b6b; font-weight: bold',
      '\n  Active subscriptions:',
      Array.from(authSubscriptions.entries()).map(([id, info]) => `\n    - ${info.source} (${id})`)
    )
  }

  return id
}

/**
 * Log and track auth subscription cleanup
 */
export function untrackAuthSubscription(id: string): void {
  if (!isDev || !id) return

  const info = authSubscriptions.get(id)
  if (info) {
    authSubscriptionCount--
    authSubscriptions.delete(id)

    const duration = Date.now() - info.createdAt
    console.log(
      `%c[AUTH-DEBUG] Subscription cleaned up: ${info.source}`,
      'color: #888; font-weight: bold',
      `\n  Duration: ${duration}ms`,
      `\n  Remaining: ${authSubscriptionCount}`
    )
  }
}

/**
 * Wrap a profile fetch with timing and logging
 */
export async function trackProfileFetch<T>(
  source: string,
  userId: string,
  query: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (!isDev) {
    return fetchFn()
  }

  const startTime = performance.now()
  console.log(
    `%c[AUTH-DEBUG] Profile fetch started: ${source}`,
    'color: #00aaff',
    `\n  User: ${userId.slice(0, 8)}...`,
    `\n  Query: ${query}`
  )

  try {
    const result = await fetchFn()
    const duration = performance.now() - startTime

    profileFetches.push({
      timestamp: Date.now(),
      duration,
      userId,
      source,
      query,
      success: true,
    })

    // Keep history bounded
    if (profileFetches.length > MAX_FETCH_HISTORY) {
      profileFetches.shift()
    }

    const color = duration > 500 ? '#ff6b6b' : duration > 200 ? '#ffaa00' : '#00ff88'
    console.log(
      `%c[AUTH-DEBUG] Profile fetch complete: ${source}`,
      `color: ${color}; font-weight: bold`,
      `\n  Duration: ${duration.toFixed(0)}ms`,
      `\n  Success: true`
    )

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    profileFetches.push({
      timestamp: Date.now(),
      duration,
      userId,
      source,
      query,
      success: false,
    })

    console.error(
      `%c[AUTH-DEBUG] Profile fetch failed: ${source}`,
      'color: #ff6b6b; font-weight: bold',
      `\n  Duration: ${duration.toFixed(0)}ms`,
      `\n  Error:`,
      error
    )

    throw error
  }
}

/**
 * Log auth state change events
 */
export function logAuthEvent(event: string, source: string, details?: Record<string, unknown>): void {
  if (!isDev) return

  console.log(
    `%c[AUTH-DEBUG] Auth event: ${event}`,
    'color: #aa88ff; font-weight: bold',
    `\n  Source: ${source}`,
    details ? `\n  Details: ${JSON.stringify(details)}` : ''
  )
}

/**
 * Get auth debug summary (for console inspection)
 */
export function getAuthDebugSummary() {
  if (!isDev) return null

  return {
    activeSubscriptions: authSubscriptionCount,
    subscriptionDetails: Array.from(authSubscriptions.entries()),
    recentFetches: profileFetches.slice(-10),
    averageFetchTime: profileFetches.length > 0
      ? profileFetches.reduce((sum, f) => sum + f.duration, 0) / profileFetches.length
      : 0,
  }
}

// Expose to window for debugging
if (typeof window !== 'undefined' && isDev) {
  (window as unknown as Record<string, unknown>).__authDebug = {
    getSummary: getAuthDebugSummary,
    getSubscriptions: () => Array.from(authSubscriptions.entries()),
    getFetches: () => profileFetches,
  }
}
