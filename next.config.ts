import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent stale page caching
  headers: async () => {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
