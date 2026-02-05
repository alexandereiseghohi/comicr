import { createWriteStream, type WriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { BatchDownloadItem, DownloadImageOptions, DownloadResult, ProgressCallback } from "../types/image-helper.types";
import {
  DownloadImageOptionsSchema,
  ensureDir,
  fileExists,
  getBackoffDelay,
  getCachedPath,
  getUniqueFilename,
  resolvePublicPath,
  sanitizeFilename,
  setCachedPath,
  toPublicRelativePath,
  validateImageFormat,
} from "./image-helper";
// Convert web ReadableStream to Node.js Readable stream
export function webStreamToNodeStream(webStream: ReadableStream<Uint8Array>): NodeJS.ReadableStream {
  const reader = webStream.getReader();
  return Readable.from(
    (async function* () {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) yield value;
      }
    })()
  );
}

// Create abort controller with timeout
export function createTimeoutController(timeoutMs: number): {
  clear: () => void;
  controller: AbortController;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}

// LOGGING UTILITY
function logError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[image-helper] ${context}:`, error);
  }
}

// URL VALIDATION
function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (!/^https?:$/.test(url.protocol)) return false;
    // Block localhost and private IPs
    const hostname = url.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
class ConcurrencyLimiter {
  private running = 0;
  private readonly queue: Array<() => void> = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = Math.max(1, limit);
  }

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

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  getStats(): { limit: number; queued: number; running: number } {
    return {
      running: this.running,
      queued: this.queue.length,
      limit: this.limit,
    };
  }
}

// Use config directly (copied from image-helper.ts)
const config = {
  maxSizeBytes: parseInt(process.env.SEED_MAX_IMAGE_SIZE_BYTES || String(5 * 1024 * 1024), 10),
  concurrency: parseInt(process.env.SEED_DOWNLOAD_CONCURRENCY || String(5), 10),
  maxRetries: parseInt(process.env.SEED_MAX_RETRIES || String(3), 10),
  requestTimeoutMs: parseInt(process.env.SEED_REQUEST_TIMEOUT_MS || String(30000), 10),
  publicDir: process.env.SEED_PUBLIC_DIR || "public",
  placeholderPath: "/placeholder-comic.jpg",
} as const;
const downloadLimiter = new ConcurrencyLimiter(config.concurrency);

// MAIN DOWNLOAD FUNCTION
export async function downloadAndSaveImage(options: DownloadImageOptions): Promise<string> {
  const parseResult = DownloadImageOptionsSchema.safeParse(options);
  if (!parseResult.success) {
    logError("Invalid DownloadImageOptions", parseResult.error);
    return config.placeholderPath;
  }
  const {
    url,
    destDir,
    filename,
    fallback = config.placeholderPath,
    maxRetries = config.maxRetries,
    skipCache = false,
  } = parseResult.data;

  if (!isSafeUrl(url)) {
    logError("Blocked unsafe URL", url);
    return fallback;
  }

  const validation = validateImageFormat(filename);
  if (!validation.valid) {
    logError("Invalid image format", validation.error);
    return fallback;
  }

  if (!skipCache) {
    const cachedPath = getCachedPath(url);
    if (cachedPath && (await fileExists(resolvePublicPath(cachedPath)))) {
      return cachedPath;
    }
  }

  const fullDestDir = resolvePublicPath(destDir);
  const targetPath = path.join(fullDestDir, sanitizeFilename(filename));

  if (await fileExists(targetPath)) {
    const relativePath = toPublicRelativePath(targetPath);
    setCachedPath(url, relativePath);
    return relativePath;
  }

  return downloadLimiter.run(async () => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const { controller, clear } = createTimeoutController(config.requestTimeoutMs);
      let writeStream: undefined | WriteStream;

      try {
        const response = await fetch(url, { signal: controller.signal });
        clear();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength > config.maxSizeBytes) {
          throw new Error(`Image too large: ${contentLength} bytes (max: ${config.maxSizeBytes})`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        await ensureDir(fullDestDir);

        const uniqueFilename = await getUniqueFilename(fullDestDir, filename);
        const finalPath = path.join(fullDestDir, uniqueFilename);

        writeStream = createWriteStream(finalPath);
        const nodeStream = webStreamToNodeStream(response.body);
        await pipeline(nodeStream, writeStream);

        const relativePath = toPublicRelativePath(finalPath);
        setCachedPath(url, relativePath);
        return relativePath;
      } catch (error) {
        if (writeStream) {
          writeStream.destroy();
        }
        lastError = error instanceof Error ? error : new Error(String(error));
        logError(`Download attempt ${attempt + 1} failed for ${url}`, lastError);

        if (lastError.message.includes("too large") || lastError.message.includes("HTTP 4")) {
          break;
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, getBackoffDelay(attempt)));
        }
      }
    }

    logError("All download attempts failed", lastError);
    return fallback;
  });
}

export async function downloadAndSaveImageWithResult(options: DownloadImageOptions): Promise<DownloadResult> {
  const parseResult = DownloadImageOptionsSchema.safeParse(options);
  const fallback =
    parseResult.success && parseResult.data.fallback ? parseResult.data.fallback : config.placeholderPath;
  const url = parseResult.success ? parseResult.data.url : options.url;

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
    logError("downloadAndSaveImageWithResult error", error);
    return {
      success: false,
      path: fallback,
      cached: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function downloadImagesInBatch(
  items: BatchDownloadItem[],
  onProgress?: ProgressCallback
): Promise<string[]> {
  const total = items.length;
  let completed = 0;

  return await Promise.all(
    items.map(async (item) => {
      const result = await downloadAndSaveImage(item);
      completed++;
      onProgress?.(completed, total, item.filename);
      return result;
    })
  );
}

export async function downloadImagesInBatchWithResults(
  items: BatchDownloadItem[],
  onProgress?: ProgressCallback
): Promise<DownloadResult[]> {
  const total = items.length;
  let completed = 0;

  return await Promise.all(
    items.map(async (item) => {
      const result = await downloadAndSaveImageWithResult(item);
      completed++;
      onProgress?.(completed, total, item.filename);
      return result;
    })
  );
}

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

    if (i < items.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
