/**
 * Sentry Server Configuration
 * Configures error tracking for Node.js server-side code
 *
 * This file runs on the server when your Next.js app starts.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

// Only initialize if DSN is configured
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment tagging
    environment: process.env.NODE_ENV ?? "development",

    // Performance monitoring - lower sample rate for server
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable profiling for performance insights
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Filter out common server errors that are not actionable
    ignoreErrors: [
      "ECONNRESET",
      "ECONNREFUSED",
      "EPIPE",
      "ETIMEDOUT",
      // Next.js internal errors
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
    ],

    // Before sending, optionally modify the event
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
        console.log("[Sentry Server] Event captured (dev mode):", hint.originalException);
        return null;
      }
      return event;
    },
  });
}
