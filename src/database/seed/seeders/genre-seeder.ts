/**
 * @file genre-seeder.ts
 * @description Seeds genres from JSON files with validation
 */

import { seedTableBatched } from "@/lib/seedHelpers";
import { GenreSeedSchema, type GenreSeed } from "@/lib/validations/seed";
import { genre } from "../../schema";

export interface GenreSeederOptions {
  /** Array of genres to seed */
  genres: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface GenreSeederResult {
  success: boolean;
  seeded: number;
  skipped: number;
  errors: Array<{ genre: unknown; error: string }>;
}

/**
 * Seeds genres from provided data with validation
 */
export async function seedGenres(options: GenreSeederOptions): Promise<GenreSeederResult> {
  const { genres: rawGenres, dryRun = false, onProgress } = options;
  const errors: Array<{ genre: unknown; error: string }> = [];
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
    };
  }

  // Report progress before seeding
  onProgress?.(0, validGenres.length);

  // Seed to database
  const result = await seedTableBatched({
    table: genre,
    items: validGenres.map((g) => ({
      name: g.name,
      slug: g.slug || g.name.toLowerCase().replace(/\s+/g, "-"),
      description: g.description || null,
      isActive: g.isActive ?? true,
    })),
    conflictKeys: [genre.name],
    updateFields: [
      { name: "slug", value: undefined },
      { name: "description", value: undefined },
      { name: "isActive", value: undefined },
    ],
    dryRun,
  });

  // Report completion
  onProgress?.(validGenres.length, validGenres.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
  };
}

export default seedGenres;
