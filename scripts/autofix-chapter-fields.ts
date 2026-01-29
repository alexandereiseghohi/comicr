import fs from "fs/promises";
import path from "path";

const chapterFiles = ["chapters.json", "chaptersdata1.json", "chaptersdata2.json"];
const requiredFields = ["id", "comicId", "title", "slug", "images"];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function main() {
  let globalId = 1;
  for (const file of chapterFiles) {
    const filePath = path.resolve(file);
    let data: any[] = [];
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
    const cleaned: any[] = [];
    const log: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const rec = { ...data[i] };
      const changes: string[] = [];
      // id
      if (rec.id === undefined || rec.id === null || rec.id === "") {
        rec.id = globalId++;
        changes.push("id (auto-assigned)");
      }
      // comicId (cannot infer, leave as is)
      if (rec.comicId === undefined || rec.comicId === null || rec.comicId === "") {
        changes.push("comicId (missing)");
      }
      // title
      if (!rec.title || typeof rec.title !== "string" || rec.title.trim() === "") {
        rec.title = "Untitled Chapter " + rec.id;
        changes.push("title (auto-filled)");
      }
      // slug
      if (!rec.slug || typeof rec.slug !== "string" || rec.slug.trim() === "") {
        rec.slug = slugify(rec.title);
        changes.push("slug (auto-generated)");
      }
      // images
      if (!Array.isArray(rec.images) || rec.images.length === 0) {
        rec.images = [];
        changes.push("images (empty)");
      }
      if (changes.length > 0) {
        log.push({ index: i, id: rec.id, changes, title: rec.title });
      }
      cleaned.push(rec);
    }
    // Write cleaned file
    const outPath = filePath.replace(/\.json$/, ".cleaned.json");
    await fs.writeFile(outPath, JSON.stringify(cleaned, null, 2), "utf8");
    // Write log
    const logPath = filePath.replace(/\.json$/, ".autofix-log.json");
    await fs.writeFile(logPath, JSON.stringify(log, null, 2), "utf8");
    console.log(`\n[${file}] Cleaned file written: ${outPath}`);
    console.log(`[${file}] Autofix log written: ${logPath}`);
    console.log(`[${file}] Total records: ${data.length}, autofixed: ${log.length}`);
  }
  console.log(
    "\nAuto-fix complete. Review .cleaned.json and .autofix-log.json files before using in seeding."
  );
}

main().catch((err) => {
  console.error("[FATAL] Unexpected error in autofix-chapter-fields:", err);
  process.exit(1);
});
