// NOTE: All file system and streaming logic has been moved to image-helper.server.ts.
// This file only exports types, config, and pure helpers for use in both client and server code.
// Only pure helpers, types, and config below. All file system and streaming logic is in image-helper.server.ts.
import fs from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import {
  ALLOWED_IMAGE_FORMATS,
  PLACEHOLDER_COMIC,
  SEED_DOWNLOAD_CONCURRENCY_VALUE,
  SEED_MAX_IMAGE_SIZE_BYTES_VALUE,
  SEED_TIMEOUT_MS_VALUE,
} from "../database/seed/seed-config";

export const DownloadImageOptionsSchema = z.object({
  destDir: z.string().min(1),
  fallback: z.string().optional(),
  filename: z.string().min(1),
  maxRetries: z.number().int().positive().optional(),
  skipCache: z.boolean().optional(),
  url: z.string().url(),
});

// ============================================================================
// CONFIGURATION (mimics DEFAULT_CONFIG, now explicit)
// ============================================================================

export const CONFIG = {
  publicDir: "public", // adjust if needed
  baseRetryDelayMs: 100,
  concurrency: SEED_DOWNLOAD_CONCURRENCY_VALUE,
  maxSizeBytes: SEED_MAX_IMAGE_SIZE_BYTES_VALUE,
  requestTimeoutMs: SEED_TIMEOUT_MS_VALUE,
  placeholderPath: PLACEHOLDER_COMIC,
};

// Helper: get file extension
function getExtension(input: string): string | undefined {
  const match = /\.([a-zA-Z0-9]+)$/.exec(input);
  return match ? match[1].toLowerCase() : undefined;
}

// Helper: check allowed formats
function isAllowedFormat(ext: string): boolean {
  return ALLOWED_IMAGE_FORMATS.includes(ext.toLowerCase());
}

/**
 * Validate image format from filename or URL
 */
export function validateImageFormat(input: string): {
  error?: string;
  ext: string;
  valid: boolean;
} {
  const ext = getExtension(input);
  if (!ext) {
    return { valid: false, ext: "", error: "No file extension found" };
  }
  if (!isAllowedFormat(ext)) {
    return {
      valid: false,
      ext,
      error: `Format '${ext}' not allowed. Allowed: ${ALLOWED_IMAGE_FORMATS.join(", ")}`,
    };
  }
  return { valid: true, ext };
}

/**
 * Check if file exists at path
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  if (typeof dirPath !== "string") {
    throw new TypeError("Directory path must be a string");
  }
  await fs.mkdir(dirPath, { recursive: true });
}
/**
 * Resolve path relative to public directory
 */
export function resolvePublicPath(relativePath: string): string {
  // Remove leading slash if present
  const cleanPath = relativePath.replace(/^\/+/, "");
  return path.resolve(CONFIG.publicDir, cleanPath);
}

/**
 * Convert absolute path to path relative to public/
 */
export function toPublicRelativePath(absolutePath: string): string {
  const publicAbs = path.resolve(CONFIG.publicDir);
  const relative = path.relative(publicAbs, absolutePath);
  // Always use forward slashes and leading /
  return "/" + relative.replaceAll("\\", "/");
}

/**
 * Sanitize filename to remove invalid characters
 */
export function sanitizeFilename(filename: string): string {
  /* eslint-disable no-control-regex -- Intentionally stripping control chars for filesystem safety */
  return filename
    .replaceAll(/[<>:"/\\|?*\x00-\x1f]/g, "-") // Replace invalid chars
    .replaceAll(/\.+/g, ".") // Collapse multiple dots
    .replaceAll(/-+/g, "-") // Collapse multiple dashes
    .replaceAll(/^[-.\s]+|[-.\s]+$/g, "") // Trim leading/trailing
    .slice(0, 255); // Max filename length
  /* eslint-enable no-control-regex */
}

/**
 * Generate unique filename to avoid collisions (server-only, see image-helper.server.ts)
 * @param _dirPath Directory path (unused in browser)
 * @param _filename Filename (unused in browser)
 */
export async function getUniqueFilename(_dirPath: string, _filename: string): Promise<string> {
  // Implementation is server-only. See image-helper.server.ts.
  throw new Error("getUniqueFilename is only available on the server (see image-helper.server.ts)");
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(attempt: number, baseDelay: number = CONFIG.baseRetryDelayMs): number {
  // Exponential backoff with jitter: 100ms, 200ms, 400ms, etc. + random 0-50ms
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 50;
  return Math.min(exponential + jitter, 10_000); // Cap at 10 seconds
}

// (ConcurrencyLimiter and downloadLimiter moved to server file)
// (webStreamToNodeStream and createTimeoutController moved to server file)
// (All file system and streaming logic is in image-helper.server.ts)

/** In-memory cache of downloaded URLs to their saved paths */
const downloadCache = new Map<string, string>();

/**
 * Get cached path for URL
 */
export function getCachedPath(url: string): string | undefined {
  return downloadCache.get(url);
}

/**
 * Add URL to cache with its saved path
 */
export function setCachedPath(url: string, savedPath: string): void {
  downloadCache.set(url, savedPath);
}

/**
 * Clear the download cache
 */
export function clearDownloadCache(): void {
  downloadCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; urls: string[] } {
  return {
    size: downloadCache.size,
    urls: [...downloadCache.keys()],
  };
}

// ============================================================================
// STREAM UTILITIES
// ============================================================================

// (webStreamToNodeStream and createTimeoutController are server-only, see image-helper.server.ts)

// ...all file system and streaming logic has been moved to image-helper.server.ts...
