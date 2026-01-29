import crypto from "crypto";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
const allowedFormats = ["jpeg", "jpg", "png", "webp", "avif"];
const maxSize = parseInt(process.env.SEED_MAX_IMAGE_SIZE_BYTES || "5242880", 10);
const concurrency = parseInt(process.env.SEED_DOWNLOAD_CONCURRENCY || "5", 10);
const placeholderComic = path.resolve("public/placeholder-comic.jpg");
const placeholderUser = path.resolve("public/shadcn.jpg");

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

function hashUrl(url: string, filename: string) {
  return crypto
    .createHash("sha256")
    .update(url + filename)
    .digest("hex");
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
  let relPath = path.join(destDir, filename);
  // Normalize: always use './' prefix for files in current directory
  if (!relPath.startsWith("./") && !relPath.startsWith("../") && !path.isAbsolute(relPath)) {
    relPath = `./${relPath}`;
  }
  const absPath = path.resolve(relPath);
  // Dedupe: check if file exists
  if (await fileExists(absPath)) return relPath;
  // Download with retries
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const size = Number(res.headers.get("content-length"));
      if (size > maxSize) throw new Error("Image too large");
      await fs.mkdir(path.dirname(absPath), { recursive: true });
      const fileStream = createWriteStream(absPath);
      await pipeline(res.body, fileStream);
      return relPath;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2 ** attempt * 100));
    }
  }
  // Fallback
  return fallback;
}
