import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session Replay - capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

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
