#!/usr/bin/env tsx
/**
 * Cleanup Duplicates Script
 * @description Finds and removes backup files, temp files, and duplicate code files
 * @usage pnpm tsx scripts/cleanup-duplicates.ts [--dry-run]
 */

import { promises as fs } from "fs";
import path from "path";

const DUPLICATE_PATTERNS = [
  /\.backup$/,
  /\.tmp$/,
  /\.temp$/,
  /\.bak$/,
  /\.old$/,
  /\.copy$/,
  /~$/,
  /-copy\./,
  /\.orig$/,
  /\(1\)\./,
  /\(2\)\./,
  /\(3\)\./,
];

const IGNORE_DIRS = ["node_modules", ".next", ".git", "dist", "build", "coverage", ".vscode"];

interface CleanupResult {
  filesFound: number;
  filesDeleted: number;
  spaceFreed: number;
  deletedFiles: string[];
}

const result: CleanupResult = {
  filesFound: 0,
  filesDeleted: 0,
  spaceFreed: 0,
  deletedFiles: [],
};

const isDryRun = process.argv.includes("--dry-run");

/**
 * Check if file matches duplicate patterns
 */
function isDuplicateFile(filename: string): boolean {
  return DUPLICATE_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Check if directory should be ignored
 */
function shouldIgnoreDir(dirName: string): boolean {
  return IGNORE_DIRS.includes(dirName);
}

/**
 * Recursively scan directory for duplicate files
 */
async function scanDirectory(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnoreDir(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (entry.isFile() && isDuplicateFile(entry.name)) {
      result.filesFound++;
      const relativePath = path.relative(process.cwd(), fullPath);
      console.log(`   Found: ${relativePath}`);

      if (!isDryRun) {
        try {
          const stats = await fs.stat(fullPath);
          await fs.unlink(fullPath);
          result.filesDeleted++;
          result.spaceFreed += stats.size;
          result.deletedFiles.push(relativePath);
          console.log(`   ✓ Deleted: ${relativePath}`);
        } catch (error) {
          console.error(`   ✗ Failed to delete: ${relativePath}`, error);
        }
      }
    }
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Main cleanup function
 */
async function cleanup() {
  console.log("🧹 Cleanup Duplicates Tool");
  console.log("==========================\n");

  if (isDryRun) {
    console.log("⚠️  DRY RUN MODE - No files will be deleted\n");
  }

  console.log("Scanning for duplicate files...\n");

  try {
    await scanDirectory(process.cwd());
  } catch (error) {
    console.error("❌ Error during scan:", error);
    process.exit(1);
  }

  console.log("\n📊 Cleanup Summary");
  console.log("==================");
  console.log(`Files found: ${result.filesFound}`);
  console.log(`Files deleted: ${result.filesDeleted}`);
  console.log(`Space freed: ${formatBytes(result.spaceFreed)}\n`);

  if (isDryRun && result.filesFound > 0) {
    console.log("💡 To actually delete these files, run without --dry-run flag\n");
  } else if (result.filesDeleted > 0) {
    console.log("✅ Cleanup complete!\n");
  } else {
    console.log("✨ No duplicate files found!\n");
  }
}

cleanup().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
