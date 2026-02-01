#!/usr/bin/env tsx
/**
 * Rename to Kebab Case Script
 * @description Renames files to kebab-case convention while preserving React component PascalCase exceptions
 * @usage pnpm tsx scripts/rename-to-kebab-case.ts [--dry-run]
 */

import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const isDryRun = process.argv.includes("--dry-run");

const IGNORE_DIRS = ["node_modules", ".next", ".git", "dist", "build", "coverage", ".vscode"];

const PASCAL_CASE_EXCEPTIONS = [
  // React components in ui directory can be PascalCase
  /^src[\/\\]components[\/\\]ui[\/\\]/,
  // Test files can match component naming
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
];

interface RenameOperation {
  from: string;
  to: string;
  reason: string;
}

const renameOperations: RenameOperation[] = [];

/**
 * Convert string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase to kebab-case
    .replace(/[\s_]+/g, "-") // spaces and underscores to dash
    .toLowerCase();
}

/**
 * Check if file should keep PascalCase
 */
function shouldKeepPascalCase(filePath: string): boolean {
  return PASCAL_CASE_EXCEPTIONS.some((pattern) => pattern.test(filePath));
}

/**
 * Check if filename needs renaming
 */
function needsRenaming(filename: string, fullPath: string): boolean {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  // Skip if it's an exception
  if (shouldKeepPascalCase(fullPath)) return false;

  // Check if already kebab-case (or already correct)
  const expectedKebab = toKebabCase(basename);

  return basename !== expectedKebab;
}

/**
 * Recursively scan directory
 */
async function scanDirectory(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      if (needsRenaming(entry.name, fullPath)) {
        const ext = path.extname(entry.name);
        const basename = path.basename(entry.name, ext);
        const newBasename = toKebabCase(basename);
        const newPath = path.join(dir, newBasename + ext);

        renameOperations.push({
          from: path.relative(process.cwd(), fullPath),
          to: path.relative(process.cwd(), newPath),
          reason: `${basename} → ${newBasename}`,
        });
      }
    }
  }
}

/**
 * Execute git mv for a rename operation
 */
function gitMoveFile(from: string, to: string): boolean {
  try {
    execSync(`git mv "${from}" "${to}"`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Main rename function
 */
async function renameFiles() {
  console.log("📝 Rename to Kebab Case");
  console.log("=======================\n");

  if (isDryRun) {
    console.log("⚠️  DRY RUN MODE - No files will be renamed\n");
  }

  console.log("Scanning for files that need renaming...\n");

  try {
    await scanDirectory("src");
  } catch (error) {
    console.error("❌ Error during scan:", error);
    process.exit(1);
  }

  console.log(`\n📊 Found ${renameOperations.length} files to rename\n`);

  if (renameOperations.length === 0) {
    console.log("✨ All files already follow kebab-case convention!\n");
    return;
  }

  console.log("Files to rename:");
  console.log("================\n");

  renameOperations.forEach((op, index) => {
    console.log(`${index + 1}. ${op.from}`);
    console.log(`   → ${op.to}`);
    console.log(`   (${op.reason})\n`);
  });

  if (!isDryRun) {
    console.log("Executing renames with git mv...\n");
    let successCount = 0;
    let failCount = 0;

    for (const op of renameOperations) {
      const success = gitMoveFile(op.from, op.to);
      if (success) {
        console.log(`✓ Renamed: ${op.from}`);
        successCount++;
      } else {
        console.error(`✗ Failed: ${op.from}`);
        failCount++;
      }
    }

    console.log(`\n✅ Rename complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}\n`);

    console.log("⚠️  NEXT STEPS:");
    console.log("   1. Update import statements to reflect new file names");
    console.log("   2. Run 'pnpm type-check' to verify no broken imports");
    console.log("   3. Commit changes: git commit -m 'Rename files to kebab-case'\n");
  } else {
    console.log("💡 To apply these renames, run without --dry-run flag\n");
  }
}

renameFiles().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
