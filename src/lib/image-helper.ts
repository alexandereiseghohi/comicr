/**
 * @file image-helper.ts
 * @description Image download utilities for seeding with deduplication, retry logic, and concurrency control.
 * All paths are relative to the public directory - do NOT include "public/" in destDir.
 */

import { createWriteStream, type WriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Supported image formats */
const ALLOWED_FORMATS = new Set(["jpeg", "jpg", "png", "webp", "avif", "gif"]);

/** Default configuration values */
const DEFAULT_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  concurrency: 5,
  maxRetries: 3,
  baseRetryDelayMs: 100,
  requestTimeoutMs: 30_000,
  publicDir: "public",
  placeholderPath: "/placeholder-comic.jpg",
} as const;

/** Runtime configuration from environment */
const config = {
  maxSizeBytes: parseInt(
    process.env.SEED_MAX_IMAGE_SIZE_BYTES || String(DEFAULT_CONFIG.maxSizeBytes),
    10
  ),
  concurrency: parseInt(
    process.env.SEED_DOWNLOAD_CONCURRENCY || String(DEFAULT_CONFIG.concurrency),
    10
  ),
  maxRetries: parseInt(process.env.SEED_MAX_RETRIES || String(DEFAULT_CONFIG.maxRetries), 10),
  requestTimeoutMs: parseInt(
    process.env.SEED_REQUEST_TIMEOUT_MS || String(DEFAULT_CONFIG.requestTimeoutMs),
    10
  ),
  publicDir: process.env.SEED_PUBLIC_DIR || DEFAULT_CONFIG.publicDir,
  placeholderPath: DEFAULT_CONFIG.placeholderPath,
} as const;

// ============================================================================
// TYPES
// ============================================================================

/** Options for downloading and saving an image */
export interface DownloadImageOptions {
  /** Source URL to download from */
  url: string;
  /** Destination directory relative to public/ (e.g., "images/comics") */
  destDir: string;
  /** Target filename with extension */
  filename: string;
  /** Fallback path if download fails (relative to public/) */
  fallback?: string;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Skip cache check (force re-download) */
  skipCache?: boolean;
}

/** Result of a download operation */
export interface DownloadResult {
  /** Whether download succeeded */
  success: boolean;
  /** Relative path from public/ to saved file */
  path: string;
  /** Whether file was retrieved from cache */
  cached: boolean;
  /** Error message if failed */
  error?: string;
}

/** Batch download item */
export interface BatchDownloadItem {
  url: string;
  destDir: string;
  filename: string;
  fallback?: string;
}

/** Progress callback for batch operations */
export type ProgressCallback = (completed: number, total: number, current: string) => void;

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Extract file extension from URL or filename
 */
export function getExtension(input: string): string {
  // Handle URLs with query params
  const cleanPath = input.split("?")[0] || input;
  const ext = path.extname(cleanPath).replace(".", "").toLowerCase();
  return ext;
}

/**
 * Check if format is allowed
 */
export function isAllowedFormat(ext: string): boolean {
  return ALLOWED_FORMATS.has(ext.toLowerCase());
}

/**
 * Validate image format from filename or URL
 */
export function validateImageFormat(input: string): {
  valid: boolean;
  ext: string;
  error?: string;
} {
  const ext = getExtension(input);
  if (!ext) {
    return { valid: false, ext: "", error: "No file extension found" };
  }
  if (!isAllowedFormat(ext)) {
    return {
      valid: false,
      ext,
      error: `Format '${ext}' not allowed. Allowed: ${[...ALLOWED_FORMATS].join(", ")}`,
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
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Resolve path relative to public directory
 */
export function resolvePublicPath(relativePath: string): string {
  // Remove leading slash if present
  const cleanPath = relativePath.replace(/^\/+/, "");
  return path.resolve(config.publicDir, cleanPath);
}

/**
 * Convert absolute path to path relative to public/
 */
export function toPublicRelativePath(absolutePath: string): string {
  const publicAbs = path.resolve(config.publicDir);
  const relative = path.relative(publicAbs, absolutePath);
  // Always use forward slashes and leading /
  return "/" + relative.replace(/\\/g, "/");
}

/**
 * Sanitize filename to remove invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-") // Replace invalid chars
    .replace(/\.+/g, ".") // Collapse multiple dots
    .replace(/-+/g, "-") // Collapse multiple dashes
    .replace(/^[-.\s]+|[-.\s]+$/g, "") // Trim leading/trailing
    .slice(0, 255); // Max filename length
}

/**
 * Generate unique filename to avoid collisions
 */
export async function getUniqueFilename(dirPath: string, filename: string): Promise<string> {
  const sanitized = sanitizeFilename(filename);
  const absPath = path.join(dirPath, sanitized);

  if (!(await fileExists(absPath))) {
    return sanitized;
  }

  const ext = path.extname(sanitized);
  const base = path.basename(sanitized, ext);
  let counter = 1;
  const maxAttempts = 1000;

  while (counter < maxAttempts) {
    const candidate = `${base}-${counter}${ext}`;
    if (!(await fileExists(path.join(dirPath, candidate)))) {
      return candidate;
    }
    counter++;
  }

  // Fallback: use timestamp
  return `${base}-${Date.now()}${ext}`;
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(
  attempt: number,
  baseDelay: number = DEFAULT_CONFIG.baseRetryDelayMs
): number {
  // Exponential backoff with jitter: 100ms, 200ms, 400ms, etc. + random 0-50ms
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 50;
  return Math.min(exponential + jitter, 10_000); // Cap at 10 seconds
}

// ============================================================================
// CONCURRENCY LIMITER
// ============================================================================

/**
 * Semaphore-based concurrency limiter for parallel operations
 */
class ConcurrencyLimiter {
  private running = 0;
  private readonly queue: Array<() => void> = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = Math.max(1, limit);
  }

  /** Acquire a slot (waits if at capacity) */
  async acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.running++;
        resolve();
      });
    });
  }

  /** Release a slot */
  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }

  /** Execute function with automatic acquire/release */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /** Get current stats */
  getStats(): { running: number; queued: number; limit: number } {
    return {
      running: this.running,
      queued: this.queue.length,
      limit: this.limit,
    };
  }
}

// Global limiter instance
const downloadLimiter = new ConcurrencyLimiter(config.concurrency);

// ============================================================================
// DOWNLOAD CACHE
// ============================================================================

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

/**
 * Convert web ReadableStream to Node.js Readable stream
 */
function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>): NodeJS.ReadableStream {
  return Readable.fromWeb(webStream as import("stream/web").ReadableStream<Uint8Array>);
}

/**
 * Create abort controller with timeout
 */
function createTimeoutController(timeoutMs: number): {
  controller: AbortController;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}

// ============================================================================
// MAIN DOWNLOAD FUNCTION
// ============================================================================

/**
 * Download and save image with deduplication, retry logic, and proper error handling.
 *
 * @param options - Download options
 * @returns Relative path from public/ to saved image (e.g., "/images/comics/cover.jpg")
 *
 * @example
 * ```ts
 * const path = await downloadAndSaveImage({
 *   url: "https://example.com/image.jpg",
 *   destDir: "images/comics",  // NOT "public/images/comics"
 *   filename: "my-comic-cover.jpg",
 * });
 * // Returns: "/images/comics/my-comic-cover.jpg"
 * ```
 */
export async function downloadAndSaveImage(options: DownloadImageOptions): Promise<string> {
  const {
    url,
    destDir,
    filename,
    fallback = config.placeholderPath,
    maxRetries = config.maxRetries,
    skipCache = false,
  } = options;

  // Validate format
  const validation = validateImageFormat(filename);
  if (!validation.valid) {
    return fallback;
  }

  // Check cache first
  if (!skipCache) {
    const cachedPath = getCachedPath(url);
    if (cachedPath && (await fileExists(resolvePublicPath(cachedPath)))) {
      return cachedPath;
    }
  }

  // Resolve full paths
  const fullDestDir = resolvePublicPath(destDir);
  const targetPath = path.join(fullDestDir, sanitizeFilename(filename));

  // Check if file already exists
  if (await fileExists(targetPath)) {
    const relativePath = toPublicRelativePath(targetPath);
    setCachedPath(url, relativePath);
    return relativePath;
  }

  // Download with concurrency limiting
  return downloadLimiter.run(async () => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const { controller, clear } = createTimeoutController(config.requestTimeoutMs);
      let writeStream: WriteStream | undefined;

      try {
        const response = await fetch(url, { signal: controller.signal });
        clear();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Check content length
        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength > config.maxSizeBytes) {
          throw new Error(`Image too large: ${contentLength} bytes (max: ${config.maxSizeBytes})`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Ensure directory exists
        await ensureDir(fullDestDir);

        // Get unique filename to avoid collisions
        const uniqueFilename = await getUniqueFilename(fullDestDir, filename);
        const finalPath = path.join(fullDestDir, uniqueFilename);

        // Stream to file
        writeStream = createWriteStream(finalPath);
        const nodeStream = webStreamToNodeStream(response.body);
        await pipeline(nodeStream, writeStream);

        // Success - cache and return
        const relativePath = toPublicRelativePath(finalPath);
        setCachedPath(url, relativePath);
        return relativePath;
      } catch (error) {
        // Clean up write stream on error
        if (writeStream) {
          writeStream.destroy();
        }
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (
          lastError.message.includes("too large") ||
          lastError.message.includes("HTTP 4") // 4xx errors
        ) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, getBackoffDelay(attempt)));
        }
      }
    }

    // All retries failed - return fallback
    return fallback;
  });
}

/**
 * Download and save image with detailed result
 */
export async function downloadAndSaveImageWithResult(
  options: DownloadImageOptions
): Promise<DownloadResult> {
  const { url, fallback = config.placeholderPath } = options;

  // Check cache
  const cachedPath = getCachedPath(url);
  if (cachedPath && (await fileExists(resolvePublicPath(cachedPath)))) {
    return { success: true, path: cachedPath, cached: true };
  }

  try {
    const resultPath = await downloadAndSaveImage(options);
    const isFallback = resultPath === fallback;
    return {
      success: !isFallback,
      path: resultPath,
      cached: false,
      error: isFallback ? "Download failed, using fallback" : undefined,
    };
  } catch (error) {
    return {
      success: false,
      path: fallback,
      cached: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Download multiple images in parallel with progress tracking
 *
 * @param items - Array of download items
 * @param onProgress - Optional progress callback
 * @returns Array of relative paths to saved images
 */
export async function downloadImagesInBatch(
  items: BatchDownloadItem[],
  onProgress?: ProgressCallback
): Promise<string[]> {
  const total = items.length;
  let completed = 0;

  const results = await Promise.all(
    items.map(async (item) => {
      const result = await downloadAndSaveImage(item);
      completed++;
      onProgress?.(completed, total, item.filename);
      return result;
    })
  );

  return results;
}

/**
 * Download multiple images with detailed results
 */
export async function downloadImagesInBatchWithResults(
  items: BatchDownloadItem[],
  onProgress?: ProgressCallback
): Promise<DownloadResult[]> {
  const total = items.length;
  let completed = 0;

  const results = await Promise.all(
    items.map(async (item) => {
      const result = await downloadAndSaveImageWithResult(item);
      completed++;
      onProgress?.(completed, total, item.filename);
      return result;
    })
  );

  return results;
}

/**
 * Download images sequentially (useful for rate-limited sources)
 */
export async function downloadImagesSequentially(
  items: BatchDownloadItem[],
  delayMs: number = 100,
  onProgress?: ProgressCallback
): Promise<string[]> {
  const results: string[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;

    const result = await downloadAndSaveImage(item);
    results.push(result);
    onProgress?.(i + 1, total, item.filename);

    // Delay between downloads (except last)
    if (i < items.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get current configuration
 */
export function getConfig(): typeof config {
  return { ...config };
}

/**
 * Get limiter statistics
 */
export function getLimiterStats(): { running: number; queued: number; limit: number } {
  return downloadLimiter.getStats();
}
