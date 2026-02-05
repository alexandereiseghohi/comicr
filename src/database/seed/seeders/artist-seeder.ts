import { downloadAndSaveImage } from "@/lib/image-helper.server";
import { seedTableBatched } from "@/lib/seed-helpers";
import { type ArtistSeed, ArtistSeedSchema } from "@/lib/validations/seed";

import { db } from "../../db";
import { artist } from "../../schema";
import { ARTISTS_IMAGE_DIR, BATCH_SIZE, PLACEHOLDER_ARTIST } from "../seed-config";

export interface ArtistSeederOptions {
  /** Array of artists to seed */
  artists: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface ArtistSeederResult {
  errors: Array<{ artist: unknown; error: string }>;
  /** Map of artist name (lowercase) to database ID */
  idMap: Map<string, number>;
  seeded: number;
  skipped: number;
  success: boolean;
}

/**
 * Seeds artists from provided data with validation
 */
export async function seedArtists(options: ArtistSeederOptions): Promise<ArtistSeederResult> {
  const { artists: rawArtists, dryRun = false, onProgress } = options;
  const errors: Array<{ artist: unknown; error: string }> = [];
  const validArtists: ArtistSeed[] = [];

  // Validate all artists
  for (const rawArtist of rawArtists) {
    const parsed = ArtistSeedSchema.safeParse(rawArtist);
    if (!parsed.success) {
      errors.push({
        artist: rawArtist,
        error: parsed.error.message,
      });
      continue;
    }
    validArtists.push(parsed.data);
  }

  if (validArtists.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawArtists.length,
      errors,
      idMap: new Map(),
    };
  }

  // Download images if not dry run
  if (!dryRun) {
    await Promise.all(
      validArtists.map(async (artistData) => {
        if (artistData.image) {
          try {
            artistData.image = await downloadAndSaveImage({
              url: artistData.image,
              destDir: ARTISTS_IMAGE_DIR,
              filename: `${artistData.name.toLowerCase().replaceAll(/\s+/g, "-")}.jpg`,
              fallback: PLACEHOLDER_ARTIST,
            });
          } catch {
            artistData.image = PLACEHOLDER_ARTIST;
          }
        }
      })
    );
  }

  // Report progress before seeding
  onProgress?.(0, validArtists.length);

  // Seed to database
  const result = await seedTableBatched({
    table: artist,
    items: validArtists.map((a) => ({
      name: a.name,
      bio: a.bio || null,
      image: a.image || null,
      isActive: a.isActive ?? true,
    })),
    conflictKeys: [artist.name],
    updateFields: [
      { name: "bio", value: undefined },
      { name: "image", value: undefined },
      { name: "isActive", value: undefined },
    ],
    batchSize: BATCH_SIZE,
    dryRun,
  });

  // Build ID map by querying inserted records (avoids separate query in orchestrator)
  const idMap = new Map<string, number>();
  if (!dryRun) {
    const seededArtists = await db.query.artist.findMany({
      columns: { id: true, name: true },
      where: (table, { inArray }) =>
        inArray(
          table.name,
          validArtists.map((a) => a.name)
        ),
    });
    for (const item of seededArtists) {
      idMap.set(item.name.toLowerCase(), item.id);
    }
  }

  // Report completion
  onProgress?.(validArtists.length, validArtists.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
    idMap,
  };
}

export default seedArtists;
