// Ensure NODE_ENV is set before anything else

import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { vi } from "vitest";

// Support running from any directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Set default test environment variables (required by @/lib/env)
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET || "test-secret-key-min-32-chars-long-for-testing-purposes";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "test-google-client-secret";
process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "test-github-client-id";
process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "test-github-client-secret";
process.env.EMAIL_FROM = process.env.EMAIL_FROM || "test@example.com";
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
process.env.CUSTOM_PASSWORD = process.env.CUSTOM_PASSWORD || "TestPass123!";
process.env.SEED_DOWNLOAD_CONCURRENCY = process.env.SEED_DOWNLOAD_CONCURRENCY || "5";
process.env.SEED_MAX_IMAGE_SIZE_BYTES = process.env.SEED_MAX_IMAGE_SIZE_BYTES || "5242880";
process.env.SEED_BATCH_SIZE = process.env.SEED_BATCH_SIZE || "100";
process.env.SEED_TIMEOUT_MS = process.env.SEED_TIMEOUT_MS || "30000";

// Mock Next.js server-only modules
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(<T extends (...args: unknown[]) => unknown>(fn: T) => fn),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));
