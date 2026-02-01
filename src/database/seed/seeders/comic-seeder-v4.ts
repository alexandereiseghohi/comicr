/**
 * @file comic-seeder-v4.ts
 * @description Seeds comics from comics.json and related files
 * @author ComicWise Team
 * @date 2026-01-30
 */

import comics from "../../../../data/seed-source/comics.json";
import { ComicSeedSchema } from "../helpers/validation-schemas";

export async function seedComics() {
  const results = [];
  for (const comic of comics) {
    const parsed = ComicSeedSchema.safeParse(comic);
    if (!parsed.success) {
      results.push({ comic, error: parsed.error });
      continue;
    }
    // Insert/upsert logic here (stub)
    results.push({ ...parsed.data, status: "seeded" });
  }
  return results;
}
