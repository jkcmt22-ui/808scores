import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session Replay - disabled to avoid CSP unsafe-eval violations
  // Sentry Replay uses new Function() internally which is blocked by our CSP
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /moz-extension/,
    // Network errors that aren't actionable
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // User aborted requests
    "AbortError",
    // Safari private browsing
    "QuotaExceededError",
  ],

  // Add context
  beforeSend(event) {
    // Don't send events from localhost
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return null
    }
    return event
  },
})
