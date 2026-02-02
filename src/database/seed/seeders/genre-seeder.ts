import { seedTableBatched } from "@/lib/seed-helpers";
import { type GenreSeed, GenreSeedSchema } from "@/lib/validations/seed";

import { db } from "../../db";
import { genre } from "../../schema";
import { BATCH_SIZE } from "../seed-config";

export interface GenreSeederOptions {
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Array of genres to seed */
  genres: unknown[];
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface GenreSeederResult {
  errors: Array<{ error: string; genre: unknown }>;
  /** Map of genre name (lowercase) to database ID */
  idMap: Map<string, number>;
  seeded: number;
  skipped: number;
  success: boolean;
}

/**
 * Seeds genres from provided data with validation
 */
export async function seedGenres(options: GenreSeederOptions): Promise<GenreSeederResult> {
  const { genres: rawGenres, dryRun = false, onProgress } = options;
  const errors: Array<{ error: string; genre: unknown }> = [];
  const validGenres: GenreSeed[] = [];

  // Validate all genres
  for (const rawGenre of rawGenres) {
    const parsed = GenreSeedSchema.safeParse(rawGenre);
    if (!parsed.success) {
      errors.push({
        genre: rawGenre,
        error: parsed.error.message,
      });
      continue;
    }
    validGenres.push(parsed.data);
  }

  if (validGenres.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawGenres.length,
      errors,
      idMap: new Map(),
    };
  }

  // Report progress before seeding
  onProgress?.(0, validGenres.length);

  // Seed to database
  const result = await seedTableBatched({
    table: genre,
    items: validGenres.map((g) => ({
      name: g.name,
      slug: g.slug || g.name.toLowerCase().replaceAll(/\s+/g, "-"),
      description: g.description || null,
      isActive: g.isActive ?? true,
    })),
    conflictKeys: [genre.name],
    updateFields: [
      { name: "slug", value: undefined },
      { name: "description", value: undefined },
      { name: "isActive", value: undefined },
    ],
    batchSize: BATCH_SIZE,
    dryRun,
  });

  // Build ID map by querying inserted records
  const idMap = new Map<string, number>();
  if (!dryRun) {
    const seededGenres = await db.query.genre.findMany({
      columns: { id: true, name: true },
      where: (table, { inArray }) =>
        inArray(
          table.name,
          validGenres.map((g) => g.name)
        ),
    });
    for (const item of seededGenres) {
      idMap.set(item.name.toLowerCase(), item.id);
    }
  }

  // Report completion
  onProgress?.(validGenres.length, validGenres.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
    idMap,
  };
}

export default seedGenres;
