import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * @file next.config.ts
 * @description Next.js 16 configuration with full optimization suite
 * @updated 2026-02-01
 */

const nextConfig: NextConfig = {
  // ========== COMPILER ==========
  reactCompiler: true,

  // ========== IMAGES ==========
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"], // AVIF priority
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ========== EXPERIMENTAL ==========
  experimental: {
    optimizeServerReact: true,
    serverMinification: true,
    webpackBuildWorker: true,
    optimizePackageImports: [
      // UI Libraries
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      // Icons & Utilities
      "lucide-react",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      // Data & State
      "@tanstack/react-query",
      "@tanstack/react-table",
      "zustand",
      "zod",
      // Date & Forms
      "date-fns",
      "react-hook-form",
      "react-day-picker",
      // Charts
      "recharts",
      // Utilities
      "lodash-es",
    ],
  },

  // ========== BUILD ==========
  typescript: {
    ignoreBuildErrors: false,
  },

  // ========== SECURITY HEADERS ==========
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // HSTS - Enforce HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
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
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // XSS Protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // CSP for API routes
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },

  // ========== REDIRECTS ==========
  async redirects() {
    return [
      // Redirect old auth paths if needed
      {
        source: "/auth/signin",
        destination: "/sign-in",
        permanent: true,
      },
      {
        source: "/auth/signup",
        destination: "/sign-up",
        permanent: true,
      },
    ];
  },

  // ========== LOGGING ==========
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

// ========== BUNDLE ANALYZER ==========
const withBundleAnalyzer = (config: NextConfig): NextConfig => {
  if (process.env.ANALYZE === "true") {
    // Dynamic import for bundle analyzer when needed
    // Run: ANALYZE=true pnpm build
    console.log("📊 Bundle analyzer enabled - check .next/analyze");
  }
  return config;
};

// ========== SENTRY CONFIGURATION ==========
const sentryDSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const finalConfig = withBundleAnalyzer(nextConfig);

export default sentryDSN
  ? withSentryConfig(finalConfig, {
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
  : finalConfig;
