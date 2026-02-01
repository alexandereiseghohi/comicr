import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Suppress Sentry build warnings in dev
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

// Export with or without Sentry based on DSN availability
const sentryDSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryDSN
  ? withSentryConfig(nextConfig, {
      // Sentry organization and project
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Only upload source maps in CI/production
      silent: !process.env.CI,

      // Upload source maps for better error debugging
      widenClientFileUpload: true,

      // Source maps configuration
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },

      // Disable automatic instrumentation for specific routes
      disableLogger: true,

      // Automatically tree-shake Sentry logger statements
      automaticVercelMonitors: true,
    })
  : nextConfig;
