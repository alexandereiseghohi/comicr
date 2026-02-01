import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";

const allowedFormats = ["jpeg", "jpg", "png", "webp", "avif"];
const maxSize = parseInt(process.env.SEED_MAX_IMAGE_SIZE_BYTES || "5242880", 10);
const concurrency = parseInt(process.env.SEED_DOWNLOAD_CONCURRENCY || "5", 10);
const placeholderComic = path.resolve("public/placeholder-comic.jpg");

// Track downloaded URLs to avoid duplicate downloads in a single run
const downloadedUrls = new Set<string>();

function getExt(url: string) {
  const ext = path.extname(url).replace(".", "").toLowerCase();
  return ext;
}

function isAllowedFormat(ext: string) {
  return allowedFormats.includes(ext);
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Simple concurrency limiter for parallel operations
 */
class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return;
    }
    return new Promise((resolve) => {
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
}

const limiter = new ConcurrencyLimiter(concurrency);

/**
 * Generate unique filename if collision exists
 */
async function getUniqueFilename(destDir: string, filename: string): Promise<string> {
  const absPath = path.resolve(destDir, filename);
  if (!(await fileExists(absPath))) return filename;

  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let counter = 1;

  while (await fileExists(path.resolve(destDir, `${base}-${counter}${ext}`))) {
    counter++;
  }

  return `${base}-${counter}${ext}`;
}

/**
 * Download and save image, dedupe by hash and path, fallback to placeholder on failure.
 * Returns relative path to saved image.
 */
export async function downloadAndSaveImage({
  url,
  destDir,
  filename,
  fallback = placeholderComic,
  maxRetries = 3,
}: {
  url: string;
  destDir: string;
  filename: string;
  fallback?: string;
  maxRetries?: number;
}): Promise<string> {
  const ext = getExt(filename);
  if (!isAllowedFormat(ext)) return fallback;

  // Check URL dedupe first (avoid redundant downloads in same run)
  if (downloadedUrls.has(url)) {
    // URL already processed, check if file exists
    let relPath = path.join(destDir, filename);
    if (!relPath.startsWith("./") && !relPath.startsWith("../") && !path.isAbsolute(relPath)) {
      relPath = `./${relPath}`;
    }
    if (await fileExists(path.resolve(relPath))) return relPath;
  }

  let relPath = path.join(destDir, filename);
  // Normalize: always use './' prefix for files in current directory
  if (!relPath.startsWith("./") && !relPath.startsWith("../") && !path.isAbsolute(relPath)) {
    relPath = `./${relPath}`;
  }
  const absPath = path.resolve(relPath);

  // Dedupe: check if file exists
  if (await fileExists(absPath)) {
    downloadedUrls.add(url);
    return relPath;
  }

  // Acquire concurrency slot
  await limiter.acquire();

  try {
    // Download with retries and exponential backoff
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const size = Number(res.headers.get("content-length"));
        if (size > maxSize) throw new Error("Image too large");
        await fs.mkdir(path.dirname(absPath), { recursive: true });

        // Handle filename collision
        const uniqueFilename = await getUniqueFilename(destDir, filename);
        const uniqueRelPath = path.join(destDir, uniqueFilename);
        const uniqueAbsPath = path.resolve(uniqueRelPath);

        const fileStream = createWriteStream(uniqueAbsPath);
        if (!res.body) throw new Error("No response body");

        // Convert web ReadableStream to Node.js stream if needed
        let nodeStream: NodeJS.ReadableStream;
        if ((res.body as unknown as NodeJS.ReadableStream & { pipe?: unknown }).pipe) {
          nodeStream = res.body as unknown as NodeJS.ReadableStream;
        } else {
          const streamModule = await import("stream");
          nodeStream = streamModule.Readable.fromWeb(
            res.body as unknown as import("stream/web").ReadableStream<Uint8Array>
          );
        }
        await pipeline(nodeStream, fileStream);

        downloadedUrls.add(url);
        const finalRelPath = `./${uniqueRelPath}`.replace(/^\.\/\.\//, "./");
        return finalRelPath;
      } catch {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 100));
      }
    }
    return fallback;
  } finally {
    limiter.release();
  }
}

/**
 * Batch download images with concurrency control
 */
export async function downloadImagesInBatch(
  images: Array<{ url: string; destDir: string; filename: string }>,
  fallback?: string
): Promise<string[]> {
  return Promise.all(
    images.map(({ url, destDir, filename }) =>
      downloadAndSaveImage({ url, destDir, filename, fallback })
    )
  );
}

/**
 * Clear the URL cache (useful for testing or between seed runs)
 */
export function clearDownloadCache(): void {
  downloadedUrls.clear();
}
