/**
 * Application Configuration
 * @description Centralized configuration using environment variables
 * Provides type-safe access to all app configuration
 */

import { getEnv } from "@/lib/env";

/**
 * Get app configuration object
 * All values are validated by Zod schema in src/lib/env.ts
 */
export function getAppConfig() {
  const env = getEnv();

  return {
    // Database
    database: {
      url: env.DATABASE_URL,
      neonUrl: env.NEON_DATABASE_URL,
    },

    // Authentication
    auth: {
      secret: env.AUTH_SECRET,
      jwtSecret: env.JWT_SECRET,
      trustHost: env.AUTH_TRUST_HOST,
      redirectProxyUrl: env.AUTH_REDIRECT_PROXY_URL,
    },

    // Providers
    providers: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },

    // Email
    email: {
      resendApiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
      nodemailer: {
        host: env.NODEMAILER_HOST,
        port: env.NODEMAILER_PORT,
        user: env.NODEMAILER_USER,
        pass: env.NODEMAILER_PASS,
      },
    },

    // Redis/Caching
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      upstash: {
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      },
    },

    // Image Services
    imageKit: {
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    },

    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },

    // Application
    app: {
      name: "ComicWise",
      url: env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      environment: env.NODE_ENV || "development",
      debug: env.DEBUG === "true",
    },

    // Sentry
    sentry: {
      dsn: env.SENTRY_DSN,
      enabled: !!env.SENTRY_DSN,
    },
  } as const;
}

// Export for convenience
export const appConfig = getAppConfig();

export default appConfig;
