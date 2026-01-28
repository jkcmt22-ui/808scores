/**
 * Navigation debugging utilities
 * Enable with DEBUG_NAV=1 environment variable
 *
 * Usage: In browser console, type `__navDebug.getSummary()` to see stats
 */

const DEBUG_ENABLED = typeof window !== 'undefined' &&
  (process.env.NEXT_PUBLIC_DEBUG_NAV === '1' ||
   (typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_NAV') === '1'))

// Generate unique IDs for tracking
let navIdCounter = 0
const generateNavId = () => `nav-${++navIdCounter}-${Date.now()}`

// Track navigation events
interface NavEvent {
  id: string
  type: 'route' | 'auth' | 'fetch' | 'loading' | 'subscription' | 'render'
  action: string
  from?: string
  to?: string
  component?: string
  duration?: number
  data?: Record<string, unknown>
  timestamp: number
}

const navEvents: NavEvent[] = []
const MAX_EVENTS = 200

// Track active loading states
const activeLoadingStates: Map<string, { component: string; startTime: number }> = new Map()

// Track subscriptions
const activeSubscriptions: Map<string, { channel: string; component: string; createdAt: number }> = new Map()

// Track fetch counts per navigation
let currentNavId = ''
const fetchCountsPerNav: Map<string, number> = new Map()

/**
 * Log a navigation event
 */
export function logNav(
  type: NavEvent['type'],
  action: string,
  data?: Record<string, unknown>
): void {
  if (!DEBUG_ENABLED) return

  const event: NavEvent = {
    id: generateNavId(),
    type,
    action,
    data,
    timestamp: Date.now(),
  }

  navEvents.push(event)
  if (navEvents.length > MAX_EVENTS) navEvents.shift()

  const color = {
    route: '#00ff88',
    auth: '#aa88ff',
    fetch: '#00aaff',
    loading: '#ffaa00',
    subscription: '#ff6b6b',
    render: '#888888',
  }[type]

  console.log(
    `%c[NAV-DEBUG] ${type.toUpperCase()}: ${action}`,
    `color: ${color}; font-weight: bold`,
    data ? data : ''
  )
}

/**
 * Track route transition
 */
export function logRouteTransition(from: string, to: string, component?: string): void {
  if (!DEBUG_ENABLED) return

  currentNavId = generateNavId()
  fetchCountsPerNav.set(currentNavId, 0)

  logNav('route', `${from} → ${to}`, { component, navId: currentNavId })
}

/**
 * Track auth state
 */
export function logAuthState(
  component: string,
  state: {
    isLoading: boolean
    hasUser: boolean
    hasProfile: boolean
    isAdmin?: boolean
    isSuperAdmin?: boolean
  }
): void {
  if (!DEBUG_ENABLED) return

  logNav('auth', `Auth state in ${component}`, state)
}

/**
 * Track loading state start
 */
export function logLoadingStart(component: string, reason: string): string {
  if (!DEBUG_ENABLED) return ''

  const id = `loading-${component}-${Date.now()}`
  activeLoadingStates.set(id, { component, startTime: Date.now() })

  logNav('loading', `START: ${component} - ${reason}`, { loadingId: id })

  return id
}

/**
 * Track loading state end
 */
export function logLoadingEnd(loadingId: string, result: 'success' | 'error' | 'timeout'): void {
  if (!DEBUG_ENABLED || !loadingId) return

  const state = activeLoadingStates.get(loadingId)
  if (state) {
    const duration = Date.now() - state.startTime
    activeLoadingStates.delete(loadingId)

    logNav('loading', `END: ${state.component} - ${result}`, {
      duration: `${duration}ms`,
      loadingId,
      isInfinite: duration > 10000
    })

    if (duration > 10000) {
      console.warn(
        `%c[NAV-DEBUG] INFINITE LOADING DETECTED in ${state.component}!`,
        'color: #ff0000; font-weight: bold; font-size: 14px',
        `Duration: ${duration}ms`
      )
    }
  }
}

/**
 * Track fetch
 */
export function logFetch(component: string, query: string, startTime?: number): void {
  if (!DEBUG_ENABLED) return

  const count = (fetchCountsPerNav.get(currentNavId) || 0) + 1
  fetchCountsPerNav.set(currentNavId, count)

  const duration = startTime ? Date.now() - startTime : undefined

  logNav('fetch', `${component}: ${query}`, {
    duration: duration ? `${duration}ms` : undefined,
    fetchCount: count,
    navId: currentNavId
  })
}

/**
 * Track subscription
 */
export function logSubscription(action: 'create' | 'cleanup', channel: string, component: string): string {
  if (!DEBUG_ENABLED) return ''

  const id = `sub-${channel}-${Date.now()}`

  if (action === 'create') {
    activeSubscriptions.set(id, { channel, component, createdAt: Date.now() })
    logNav('subscription', `CREATE: ${channel} in ${component}`, {
      subId: id,
      totalActive: activeSubscriptions.size
    })

    if (activeSubscriptions.size > 5) {
      console.warn(
        `%c[NAV-DEBUG] HIGH SUBSCRIPTION COUNT: ${activeSubscriptions.size}`,
        'color: #ff6b6b; font-weight: bold'
      )
    }
  } else {
    activeSubscriptions.delete(id)
    logNav('subscription', `CLEANUP: ${channel} in ${component}`, {
      subId: id,
      totalActive: activeSubscriptions.size
    })
  }

  return id
}

/**
 * Track component render
 */
export function logRender(component: string, reason?: string): void {
  if (!DEBUG_ENABLED) return

  logNav('render', `${component}${reason ? `: ${reason}` : ''}`)
}

/**
 * Get debug summary
 */
export function getNavDebugSummary() {
  return {
    enabled: DEBUG_ENABLED,
    totalEvents: navEvents.length,
    recentEvents: navEvents.slice(-20),
    activeLoadingStates: Array.from(activeLoadingStates.entries()).map(([id, state]) => ({
      id,
      component: state.component,
      duration: Date.now() - state.startTime,
    })),
    activeSubscriptions: Array.from(activeSubscriptions.entries()).map(([id, sub]) => ({
      id,
      channel: sub.channel,
      component: sub.component,
      age: Date.now() - sub.createdAt,
    })),
    fetchCountsPerNav: Object.fromEntries(fetchCountsPerNav),
    currentNavId,
  }
}

/**
 * Check for infinite loading
 */
export function checkInfiniteLoading(): { isInfinite: boolean; components: string[] } {
  const infiniteComponents: string[] = []
  const now = Date.now()

  activeLoadingStates.forEach((state, id) => {
    if (now - state.startTime > 10000) {
      infiniteComponents.push(state.component)
    }
  })

  return {
    isInfinite: infiniteComponents.length > 0,
    components: infiniteComponents,
  }
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__navDebug = {
    getSummary: getNavDebugSummary,
    getEvents: () => navEvents,
    getLoadingStates: () => Array.from(activeLoadingStates.entries()),
    getSubscriptions: () => Array.from(activeSubscriptions.entries()),
    checkInfinite: checkInfiniteLoading,
    enable: () => { localStorage.setItem('DEBUG_NAV', '1'); location.reload() },
    disable: () => { localStorage.removeItem('DEBUG_NAV'); location.reload() },
  }

  // Auto-check for infinite loading every 5 seconds
  if (DEBUG_ENABLED) {
    setInterval(() => {
      const result = checkInfiniteLoading()
      if (result.isInfinite) {
        console.error(
          `%c[NAV-DEBUG] INFINITE LOADING DETECTED!`,
          'color: #ff0000; font-weight: bold; font-size: 16px',
          `\nComponents stuck: ${result.components.join(', ')}`,
          `\nRun __navDebug.getSummary() for details`
        )
      }
    }, 5000)
  }
}
