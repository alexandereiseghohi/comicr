/**
 * Truncate all seeded tables (for development reseeding)
 */
import { sql } from "drizzle-orm";

import { db } from "../src/database/db";

async function truncate() {
  console.log("Truncating all tables...");

  // Truncate tables in order (respecting foreign keys with CASCADE)
  const tables = [
    "chapterImage",
    "chapter",
    '"comicToGenre"',
    "comic",
    "genre",
    "type",
    "artist",
    "author",
    "session",
    "account",
    '"user"',
  ];

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`));
      console.log(`  Truncated ${table}`);
    } catch {
      console.log(`  Skipped ${table} (may not exist)`);
    }
  }

  console.log("Done!");
}

truncate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error truncating tables:", err);
    process.exit(1);
  });
