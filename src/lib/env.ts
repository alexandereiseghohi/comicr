import { z } from "zod";

/**
 * Environment variable schema definition
 * Validates all 60+ environment variables on app load
 */
const envSchema = z.object({
  // ========== DATABASE ==========
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  NEON_DATABASE_URL: z.string().url("NEON_DATABASE_URL must be a valid URL").optional(),

  // ========== AUTH ==========
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_TRUST_HOST: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  AUTH_REDIRECT_PROXY_URL: z.string().url().optional(),

  // ========== PROVIDERS ==========
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET required"),

  // ========== EMAIL ==========
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),
  NODEMAILER_HOST: z.string().optional(),
  NODEMAILER_PORT: z.string().transform(Number).optional(),
  NODEMAILER_USER: z.string().optional(),
  NODEMAILER_PASS: z.string().optional(),

  // ========== REDIS ==========
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ========== IMAGE SERVICES ==========
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // ========== STORAGE ==========
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().optional(),

  // ========== MONITORING ==========
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),

  // ========== PAYMENT ==========
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // ========== SUPABASE ==========
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  // ========== API ==========
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be valid"),
  API_BASE_URL: z.string().url("API_BASE_URL must be valid").optional(),

  // ========== DEVELOPMENT ==========
  CUSTOM_PASSWORD: z.string().min(8, "CUSTOM_PASSWORD must be at least 8 characters"),
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  ENVIRONMENT: z.enum(["development", "staging", "production", "test"]).default("development"),

  // ========== FEATURES ==========
  ENABLE_SEEDING: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(false),
  ENABLE_ANALYTICS: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(true),
  ENABLE_ERROR_TRACKING: z
    .string()
    .transform((v) => v === "true")
    .pipe(z.boolean())
    .default(true),

  // ========== LOGGING ==========
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DEBUG: z.string().optional(),

  // ========== SECURITY ==========
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // ========== JWT ==========
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("WbYU4gxMwZnr+uMTyvukYzsGMrpgoeT81qWSJZbTJDc="),
  JWT_EXPIRY: z.string().default("7d"),
  REFRESH_TOKEN_EXPIRY: z.string().default("30d"),

  // ========== FILE UPLOAD ==========
  MAX_FILE_SIZE: z.coerce.number().default(52428800),
  ALLOWED_FILE_TYPES: z.string().default(".jpg,.jpeg,.png,.gif,.webp,.pdf"),

  // ========== SEEDING ==========
  SEED_API_KEY: z.string().optional(),
  SEED_DOWNLOAD_CONCURRENCY: z.coerce.number().min(1).max(20).default(5),
  SEED_MAX_IMAGE_SIZE_BYTES: z.coerce.number().min(1048576).max(104857600).default(5242880), // 1MB - 100MB, default 5MB
  SEED_BATCH_SIZE: z.coerce.number().min(10).max(1000).default(100),
  SEED_TIMEOUT_MS: z.coerce.number().min(1000).max(300000).default(30000), // 1s - 5min, default 30s

  // ========== CACHE ==========
  CACHE_TTL: z.coerce.number().default(3600),
  CACHE_REDIS_TTL: z.coerce.number().default(86400),
});

/**
 * Validated environment variables
 * Safe to use throughout the application
 */
let env: null | z.infer<typeof envSchema> = null;

/**
 * Get validated env object (lazy loaded)
 * @returns {z.infer<typeof envSchema>} Validated environment variables
 * @throws {Error} If validation fails
 */
export function getEnv(): z.infer<typeof envSchema> {
  if (env) return env;

  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
      throw new Error(`Environment variable validation failed:\n${errors}`);
    }
    throw error;
  }
}

/**
 * Export individual typed env vars for convenience
 * Usage: import { DATABASE_URL, GOOGLE_CLIENT_ID } from '@/lib/env'
 */
export const {
  DATABASE_URL,
  AUTH_SECRET,
  AUTH_TRUST_HOST,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  RESEND_API_KEY,
  EMAIL_FROM,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
  CLOUDINARY_CLOUD_NAME,
  SENTRY_DSN,
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_API_URL,
  NODE_ENV,
  CUSTOM_PASSWORD,
  ENABLE_SEEDING,
  ENABLE_ANALYTICS,
  SEED_API_KEY,
  SEED_DOWNLOAD_CONCURRENCY,
  SEED_MAX_IMAGE_SIZE_BYTES,
  SEED_BATCH_SIZE,
  SEED_TIMEOUT_MS,
} = getEnv();
