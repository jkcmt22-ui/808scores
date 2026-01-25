import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  // Prevent stale page caching
  headers: async () => {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs in CI
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite
  // to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Source maps configuration
  sourcemaps: {
    // Hide source maps from client bundles
    deleteSourcemapsAfterUpload: true,
  },
})
