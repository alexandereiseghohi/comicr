/**
 * @file merge-seed-data.ts
 * @description Merges multiple JSON seed files into consolidated single files
 * @author ComicWise Team
 * @date 2026-02-01
 */

import fs from "node:fs/promises";
import path from "node:path";

interface MergeConfig {
  sourceFiles: string[];
  outputFile: string;
  description: string;
}

const SEED_DIR = path.resolve("data/seed-source");
const OUTPUT_DIR = path.resolve("data/seed-source");

const mergeConfigs: MergeConfig[] = [
  {
    sourceFiles: ["comics.json", "comicsdata1.json", "comicsdata2.json"],
    outputFile: "comics-merged.json",
    description: "All comic entries",
  },
  {
    sourceFiles: ["chapters.json", "chaptersdata1.json", "chaptersdata2.json"],
    outputFile: "chapters-merged.json",
    description: "All chapter entries",
  },
];

/**
 * Load and parse JSON file
 */
async function loadJsonFile(filePath: string): Promise<unknown[]> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`⚠️  File not found: ${filePath}`);
      return [];
    }
    throw error;
  }
}

/**
 * Merge multiple JSON files into one
 */
async function mergeFiles(config: MergeConfig): Promise<void> {
  console.log(`\n📦 Merging ${config.description}...`);

  const allData: unknown[] = [];

  for (const sourceFile of config.sourceFiles) {
    const filePath = path.join(SEED_DIR, sourceFile);
    const data = await loadJsonFile(filePath);

    if (data.length > 0) {
      console.log(`  ✓ Loaded ${data.length} entries from ${sourceFile}`);
      allData.push(...data);
    } else {
      console.log(`  ⊘ Skipped empty file: ${sourceFile}`);
    }
  }

  // Write merged file
  const outputPath = path.join(OUTPUT_DIR, config.outputFile);
  await fs.writeFile(outputPath, JSON.stringify(allData, null, 2), "utf8");

  console.log(`  ✓ Merged ${allData.length} total entries → ${config.outputFile}`);
}

/**
 * Generate merge report
 */
async function generateReport(configs: MergeConfig[]): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    merges: [] as Array<{
      outputFile: string;
      description: string;
      sourceFiles: string[];
      totalEntries: number;
    }>,
  };

  for (const config of configs) {
    const outputPath = path.join(OUTPUT_DIR, config.outputFile);
    const data = await loadJsonFile(outputPath);

    report.merges.push({
      outputFile: config.outputFile,
      description: config.description,
      sourceFiles: config.sourceFiles,
      totalEntries: data.length,
    });
  }

  const reportPath = path.join(OUTPUT_DIR, "merge-report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`\n📊 Merge report saved to: merge-report.json`);
}

/**
 * Main execution
 */
async function main() {
  console.log("🔀 Starting seed data merge process...\n");

  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Merge all configured file sets
    for (const config of mergeConfigs) {
      await mergeFiles(config);
    }

    // Generate merge report
    await generateReport(mergeConfigs);

    console.log("\n✅ Merge process completed successfully!");
  } catch (error) {
    console.error("\n❌ Merge process failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { generateReport, mergeFiles };
