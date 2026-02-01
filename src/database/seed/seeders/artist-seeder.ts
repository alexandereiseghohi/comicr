/**
 * @file artist-seeder.ts
 * @description Seeds artists from JSON files with validation and image handling
 */

import { downloadAndSaveImage } from "@/lib/image-helper";
import { seedTableBatched } from "@/lib/seed-helpers";
import { ArtistSeedSchema, type ArtistSeed } from "@/lib/validations/seed";
import path from "path";
import { artist } from "../../schema";

const ARTISTS_IMAGE_DIR = "public/images/artists";
const PLACEHOLDER_ARTIST = "/images/placeholder-artist.png";

export interface ArtistSeederOptions {
  /** Array of artists to seed */
  artists: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface ArtistSeederResult {
  success: boolean;
  seeded: number;
  skipped: number;
  errors: Array<{ artist: unknown; error: string }>;
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
              destDir: path.join(ARTISTS_IMAGE_DIR),
              filename: `${artistData.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
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
    dryRun,
  });

  // Report completion
  onProgress?.(validArtists.length, validArtists.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
  };
}

export default seedArtists;
