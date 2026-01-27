import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cmsknsbsoyxezgaqalrc.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media0.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media1.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media2.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media3.giphy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media4.giphy.com',
        pathname: '/**',
      },
    ],
    // Optimize images with modern formats
    formats: ['image/avif', 'image/webp'],
  },
  // Security and caching headers
  headers: async () => {
    // Content Security Policy
    // Note: 'unsafe-inline' is needed for Next.js and styled-jsx
    // 'unsafe-eval' is needed for development mode only
    const isDev = process.env.NODE_ENV === 'development'

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://vercel.live https://*.vercel-scripts.com https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://media.giphy.com https://media0.giphy.com https://media1.giphy.com https://media2.giphy.com https://media3.giphy.com https://media4.giphy.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.giphy.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.sentry.io",
      "frame-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Cache control
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Enable browser XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          // Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
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
