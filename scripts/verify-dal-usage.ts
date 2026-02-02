#!/usr/bin/env tsx
/**
 * DAL Verification Script
 * @description Scans src/lib/actions for direct database queries and validates DAL compliance
 * @usage pnpm tsx scripts/verify-dal-usage.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";

interface Violation {
  code: string;
  file: string;
  line: number;
}

const DIRECT_DB_PATTERNS = [
  /db\.select\(/,
  /db\.insert\(/,
  /db\.update\(/,
  /db\.delete\(/,
  /db\.query\./,
  /from\(.*\)\.where\(/,
];

const ACTIONS_DIR = path.join(process.cwd(), "src", "lib", "actions");
const violations: Violation[] = [];
let filesScanned = 0;

/**
 * Scan a file for direct database query usage
 */
async function scanFile(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  for (const [index, line] of lines.entries()) {
    // Skip import statements and comments
    if (
      line.trim().startsWith("import") ||
      line.trim().startsWith("//") ||
      line.trim().startsWith("*")
    ) {
      continue;
    }

    // Check for direct database queries
    for (const pattern of DIRECT_DB_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: index + 1,
          code: line.trim(),
        });
      }
    }
  }

  filesScanned++;
}

/**
 * Recursively scan directory for TypeScript files
 */
async function scanDirectory(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      await scanFile(fullPath);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("🔍 DAL Compliance Verification");
  console.log("================================\n");

  console.log(`Scanning directory: ${ACTIONS_DIR}\n`);

  try {
    await scanDirectory(ACTIONS_DIR);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(`❌ Error: Directory not found - ${ACTIONS_DIR}`);
      process.exit(1);
    }
    throw error;
  }

  console.log(`\n📊 Scan Results:`);
  console.log(`   Files scanned: ${filesScanned}`);
  console.log(`   Violations found: ${violations.length}\n`);

  if (violations.length > 0) {
    console.log("⚠️  VIOLATIONS DETECTED");
    console.log("======================\n");
    console.log("Server actions should use DAL classes instead of direct database queries.\n");

    for (const [index, violation] of violations.entries()) {
      console.log(`${index + 1}. ${violation.file}:${violation.line}`);
      console.log(`   ${violation.code}\n`);
    }

    console.log("\n💡 Recommendation:");
    console.log("   - Use DAL classes from '@/dal' for database operations");
    console.log("   - Server actions should call DAL methods, not raw Drizzle queries");
    console.log("   - Move complex queries to DAL or database/queries layer\n");

    process.exit(1);
  } else {
    console.log("✅ SUCCESS");
    console.log("==========\n");
    console.log("All server actions are 100% DAL compliant!");
    console.log("No direct database queries found.\n");

    process.exit(0);
  }
}

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
