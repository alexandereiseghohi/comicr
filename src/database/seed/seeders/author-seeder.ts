import { downloadAndSaveImage } from "@/lib/image-helper";
import { seedTableBatched } from "@/lib/seed-helpers";
import { type AuthorSeed, AuthorSeedSchema } from "@/lib/validations/seed";

import { db } from "../../db";
import { author } from "../../schema";
import { AUTHORS_IMAGE_DIR, BATCH_SIZE, PLACEHOLDER_AUTHOR } from "../seed-config";

export interface AuthorSeederOptions {
  /** Array of authors to seed */
  authors: unknown[];
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number) => void;
}

export interface AuthorSeederResult {
  errors: Array<{ author: unknown; error: string }>;
  /** Map of author name (lowercase) to database ID */
  idMap: Map<string, number>;
  seeded: number;
  skipped: number;
  success: boolean;
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
      idMap: new Map(),
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
              destDir: AUTHORS_IMAGE_DIR,
              filename: `${authorData.name.toLowerCase().replaceAll(/\s+/g, "-")}.jpg`,
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
    batchSize: BATCH_SIZE,
    dryRun,
  });

  // Build ID map by querying inserted records (avoids separate query in orchestrator)
  const idMap = new Map<string, number>();
  if (!dryRun) {
    const seededAuthors = await db.query.author.findMany({
      columns: { id: true, name: true },
      where: (table, { inArray }) =>
        inArray(
          table.name,
          validAuthors.map((a) => a.name)
        ),
    });
    for (const item of seededAuthors) {
      idMap.set(item.name.toLowerCase(), item.id);
    }
  }

  // Report completion
  onProgress?.(validAuthors.length, validAuthors.length);

  return {
    success: true,
    seeded: result.inserted,
    skipped: errors.length,
    errors,
    idMap,
  };
}

export default seedAuthors;
