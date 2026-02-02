import { existsSync } from "node:fs";
import { readFile, stat, symlink } from "node:fs/promises";
import path from "node:path";

import xxhash from "xxhash-wasm";

/**
 * Global hash cache: filepath → hash
 * Persists for duration of seed process
 */
const fileHashCache = new Map<string, string>();

/**
 * Global hash → filepath mapping
 * Used to detect duplicates and create symlinks
 */
const hashToFileMap = new Map<string, string>();

/**
 * Initialize xxhash hasher API (singleton)
 */
let hasherInstance: Awaited<ReturnType<typeof xxhash>> | null = null;

async function getHasher() {
  if (!hasherInstance) {
    hasherInstance = await xxhash();
  }
  return hasherInstance;
}

/**
 * Calculate xxhash64 hash of image file
 * @param filePath - Absolute path to image file
 * @returns Hex hash string (16 chars)
 */
export async function hashImageFile(filePath: string): Promise<string> {
  // Check cache first
  if (fileHashCache.has(filePath)) {
    return fileHashCache.get(filePath)!;
  }

  const hasher = await getHasher();
  const buffer = await readFile(filePath);
  // Use h64Raw for Uint8Array buffers
  const hashBigInt = hasher.h64Raw(buffer);
  const hash = hashBigInt.toString(16).padStart(16, "0");

  fileHashCache.set(filePath, hash);
  return hash;
}

/**
 * Check if image content already exists based on hash
 * @param filePath - Path to new image file
 * @returns Existing file path if duplicate found, otherwise null
 */
export async function findDuplicateByHash(filePath: string): Promise<null | string> {
  if (!existsSync(filePath)) {
    return null;
  }

  const hash = await hashImageFile(filePath);

  // Check if this hash already exists
  if (hashToFileMap.has(hash)) {
    const existingPath = hashToFileMap.get(hash)!;

    // Verify existing file still exists
    if (existsSync(existingPath)) {
      return existingPath;
    }

    // Clean up stale entry
    hashToFileMap.delete(hash);
  }

  // Register this file as the canonical version for this hash
  hashToFileMap.set(hash, filePath);
  return null;
}

/**
 * Create symlink to existing image file (save storage)
 * @param targetPath - Path to existing image file
 * @param linkPath - Path where symlink should be created
 */
export async function createImageSymlink(targetPath: string, linkPath: string): Promise<void> {
  // Make relative symlink for portability
  const relativeTarget = path.relative(path.dirname(linkPath), targetPath);

  try {
    await symlink(relativeTarget, linkPath, "file");
  } catch {
    // If symlink fails (Windows permissions, etc.), fallback to copy
    const { copyFile } = await import("node:fs/promises");
    await copyFile(targetPath, linkPath);
  }
}

/**
 * Get statistics about image deduplication
 * @returns Stats object with counts and storage saved
 */
export async function getDeduplicationStats(): Promise<{
  duplicates: number;
  storageSavedBytes: number;
  storageSavedMB: string;
  totalImages: number;
  uniqueImages: number;
}> {
  const totalImages = fileHashCache.size;
  const uniqueImages = hashToFileMap.size;
  const duplicates = totalImages - uniqueImages;

  // Calculate storage saved (approximate)
  let storageSavedBytes = 0;
  for (const [hash, filePath] of hashToFileMap.entries()) {
    try {
      const stats = await stat(filePath);
      const duplicateCount = Array.from(fileHashCache.entries()).filter(([, h]) => h === hash).length - 1;
      storageSavedBytes += stats.size * duplicateCount;
    } catch {
      // Ignore stat errors
    }
  }

  return {
    totalImages,
    uniqueImages,
    duplicates,
    storageSavedBytes,
    storageSavedMB: (storageSavedBytes / 1024 / 1024).toFixed(2),
  };
}

/**
 * Clear all deduplication caches
 */
export function clearDeduplicationCache(): void {
  fileHashCache.clear();
  hashToFileMap.clear();
}

/**
 * Process downloaded image: check for duplicates and create symlink if needed
 * @param imagePath - Path to newly downloaded image
 * @returns Object indicating if duplicate was found and symlink created
 */
export async function processDuplicateImage(imagePath: string): Promise<{
  isDuplicate: boolean;
  originalPath?: string;
  symlinkCreated?: boolean;
}> {
  const duplicatePath = await findDuplicateByHash(imagePath);

  if (!duplicatePath) {
    return { isDuplicate: false };
  }

  // Duplicate found - replace downloaded file with symlink
  const { unlink } = await import("node:fs/promises");

  try {
    // Remove the newly downloaded file
    await unlink(imagePath);

    // Create symlink to existing file
    await createImageSymlink(duplicatePath, imagePath);

    return {
      isDuplicate: true,
      originalPath: duplicatePath,
      symlinkCreated: true,
    };
  } catch {
    // If symlink creation fails, keep the downloaded file
    return {
      isDuplicate: true,
      originalPath: duplicatePath,
      symlinkCreated: false,
    };
  }
}

/**
 * Legacy function for backward compatibility
 */
export function deduplicateImages(images: string[]) {
  // Return unique set
  return Array.from(new Set(images));
}
