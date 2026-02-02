import fs from "node:fs/promises";
import path from "node:path";

const chapterFiles = ["chapters.json", "chaptersdata1.json", "chaptersdata2.json"];
const requiredFields = ["id", "comicId", "title", "slug", "images"];

async function main() {
  let totalRecords = 0;
  let totalMissing = 0;
  type Chapter = {
    [key: string]: unknown;
    comicId: string;
    id: string;
    images: string[];
    slug: string;
    title: string;
  };
  type MissingEntry = { index: number; missingFields: string[]; record: Chapter };
  const missingByFile: Record<string, MissingEntry[]> = {};

  for (const file of chapterFiles) {
    const filePath = path.resolve(file);
    let data: Chapter[] = [];
    try {
      if (
        await fs.stat(filePath).then(
          () => true,
          () => false
        )
      ) {
        data = JSON.parse(await fs.readFile(filePath, "utf8"));
        if (!Array.isArray(data)) {
          console.warn(`[WARN] File ${file} does not contain an array.`);
          continue;
        }
      } else {
        console.warn(`[WARN] File ${file} not found.`);
        continue;
      }
    } catch (err) {
      console.error(`[ERROR] Failed to read ${file}:`, err);
      continue;
    }
    totalRecords += data.length;
    const missing = data
      .map((rec, idx) => {
        const missingFields = requiredFields.filter((f) =>
          f === "images"
            ? !Array.isArray(rec.images) || rec.images.length === 0
            : rec[f] === undefined || rec[f] === null || rec[f] === ""
        );
        return missingFields.length > 0 ? { index: idx, missingFields, record: rec } : null;
      })
      .filter(Boolean);
    if (missing.length > 0) {
      const filtered: MissingEntry[] = missing.filter((x): x is MissingEntry => x !== null);
      totalMissing += filtered.length;
      missingByFile[file] = filtered;
    }
  }

  // Summary
  console.log("\n=== Chapter Data Missing Fields Report ===");
  console.log(`Total records scanned: ${totalRecords}`);
  console.log(`Total records missing required fields: ${totalMissing}`);
  for (const [file, missing] of Object.entries(missingByFile)) {
    console.log(`\nFile: ${file}`);
    console.log(`  Records missing fields: ${missing.length}`);
    for (const entry of missing.slice(0, 10)) {
      if (entry && Array.isArray(entry.missingFields) && entry.record && typeof entry.record === "object") {
        console.log(`    [Index ${entry.index}] Missing: ${entry.missingFields.join(", ")}`);
        // Optionally, print a summary of the record
        console.log(`      Title: ${entry.record.title || "(no title)"}, Slug: ${entry.record.slug || "(no slug)"}`);
      }
    }
    if (missing.length > 10) {
      console.log(`    ...and ${missing.length - 10} more in this file.`);
    }
  }
  if (totalMissing === 0) {
    console.log("\nAll chapter records have required fields.\n");
  } else {
    console.log("\nSome chapter records are missing required fields. See above for details.\n");
  }
}

main().catch((err) => {
  console.error("[FATAL] Unexpected error in report-missing-chapter-fields:", err);
  process.exit(1);
});
