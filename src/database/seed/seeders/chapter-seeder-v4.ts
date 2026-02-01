/**
 * @file chapter-seeder-v4.ts
 * @description Seeds chapters from chapters.json and related files
 * @author ComicWise Team
 * @date 2026-01-30
 */

import chapters from "../../../../data/seed-source/chapters.json";
import { ChapterSeedSchema } from "../helpers/validation-schemas";

export async function seedChapters() {
  const results = [];
  for (const chapter of chapters) {
    const parsed = ChapterSeedSchema.safeParse(chapter);
    if (!parsed.success) {
      results.push({ chapter, error: parsed.error });
      continue;
    }
    // Insert/upsert logic here (stub)
    results.push({ ...parsed.data, status: "seeded" });
  }
  return results;
}
