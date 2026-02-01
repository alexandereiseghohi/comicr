/**
 * Sentry Edge Configuration
 * Configures error tracking for Edge Runtime (middleware, edge functions)
 *
 * This file runs in the Edge Runtime environment.
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

    // Performance monitoring for edge functions
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Enable debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Before sending, optionally modify the event
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
        console.log("[Sentry Edge] Event captured (dev mode):", hint.originalException);
        return null;
      }
      return event;
    },
  });
}
