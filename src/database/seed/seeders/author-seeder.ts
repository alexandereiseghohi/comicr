/**
 * @file author-seeder.ts
 * @description Seeds authors from JSON files with validation and image handling
 */

import { downloadAndSaveImage } from "@/lib/imageHelper";
import { seedTableBatched } from "@/lib/seedHelpers";
import { AuthorSeedSchema, type AuthorSeed } from "@/lib/validations/seed";
import path from "path";
import { author } from "../../schema";

const AUTHORS_IMAGE_DIR = "public/images/authors";
const PLACEHOLDER_AUTHOR = "/images/placeholder-author.png";

export interface AuthorSeederOptions {
  /** Array of authors to seed */
  authors: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface AuthorSeederResult {
  success: boolean;
  seeded: number;
  skipped: number;
  errors: Array<{ author: unknown; error: string }>;
}

/**
 * Seeds authors from provided data with validation
 */
export async function seedAuthors(options: AuthorSeederOptions): Promise<AuthorSeederResult> {
  const { authors: rawAuthors, dryRun = false, onProgress } = options;
  const errors: Array<{ author: unknown; error: string }> = [];
  const validAuthors: AuthorSeed[] = [];

  // Validate all authors
  for (const rawAuthor of rawAuthors) {
    const parsed = AuthorSeedSchema.safeParse(rawAuthor);
    if (!parsed.success) {
      errors.push({
        author: rawAuthor,
        error: parsed.error.message,
      });
      continue;
    }
    validAuthors.push(parsed.data);
  }

  if (validAuthors.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawAuthors.length,
      errors,
    };
  }

  // Download images if not dry run
  if (!dryRun) {
    await Promise.all(
      validAuthors.map(async (authorData) => {
        if (authorData.image) {
          try {
            authorData.image = await downloadAndSaveImage({
              url: authorData.image,
              destDir: path.join(AUTHORS_IMAGE_DIR),
              filename: `${authorData.name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
              fallback: PLACEHOLDER_AUTHOR,
            });
          } catch {
            authorData.image = PLACEHOLDER_AUTHOR;
          }
        }
      })
    );
  }

  // Report progress before seeding
  onProgress?.(0, validAuthors.length);

  // Seed to database
  const result = await seedTableBatched({
    table: author,
    items: validAuthors.map((a) => ({
      name: a.name,
      bio: a.bio || null,
      image: a.image || null,
      isActive: a.isActive ?? true,
    })),
    conflictKeys: [author.name],
    updateFields: [
      { name: "bio", value: undefined },
      { name: "image", value: undefined },
      { name: "isActive", value: undefined },
    ],
    dryRun,
  });

  // Report completion
  onProgress?.(validAuthors.length, validAuthors.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
  };
}

export default seedAuthors;
