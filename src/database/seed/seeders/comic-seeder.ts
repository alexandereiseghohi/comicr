// --- Helper: Normalize a slug by removing UUID suffix (e.g., "comic-name-abc123" → "comic-name")
function normalizeSlug(slug: string): string {
  // UUID suffix pattern: hyphen followed by 8 hex characters at end
  return slug.replace(/-[a-f0-9]{8}$/, "");
}
import { db } from "@/database/db";
import { comic, comicToGenre } from "@/database/schema";
import { downloadAndSaveImage } from "@/lib/image-helper.server";
import { seedTableBatched } from "@/lib/seed-helpers";
import { type ComicSeed, normalizeDateString, normalizeGenres } from "@/validations/seed";

import { COMICS_COVER_DIR, PLACEHOLDER_COMIC } from "../seed-config";

import seedChapters, { type ChapterSeederResult } from "./chapter-seeder";

// Removed unused zod imports

// Define types here to avoid circular dependency and missing export errors
export interface ComicSeederOptions {
  comics: any[];
  chapters: any[];
  authorMap: Map<string, number>;
  artistMap: Map<string, number>;
  typeMap: Map<string, number>;
  genreMap: Map<string, number>;
  dryRun?: boolean;
  onProgress?: (current: number, total: number) => void;
  downloadConcurrency?: number;
}

export interface ComicSeederResult {
  success: boolean;
  seeded: number;
  skipped: number;
  duplicatesSkipped: number;
  errors: Array<{ comic: unknown; error: string }>;
  duplicateReport: any;
  comicSlugMap: Map<string, number>;
  chaptersResult?: any;
}

// --- Helper: Download cover images for comics ---
async function downloadCoverImagesForComics(
  comics: ComicSeed[],
  onProgress?: (current: number, total: number) => void
) {
  let downloaded = 0;
  const total = comics.length;
  await Promise.all(
    comics.map(async (comicData) => {
      if (comicData.coverImage && comicData.coverImage.startsWith("http")) {
        try {
          comicData.coverImage = await downloadAndSaveImage({
            url: comicData.coverImage,
            destDir: COMICS_COVER_DIR,
            filename: `${comicData.slug}.webp`,
            fallback: PLACEHOLDER_COMIC,
          });
        } catch {
          comicData.coverImage = PLACEHOLDER_COMIC;
        }
      } else if (!comicData.coverImage) {
        comicData.coverImage = PLACEHOLDER_COMIC;
      }
      downloaded++;
      onProgress?.(downloaded, total);
    })
  );
}

/**
 * Extract cover image URL from various formats
 */
function extractCoverImage(comicData: Record<string, unknown>): string {
  // Try direct coverImage field
  if (typeof comicData.coverImage === "string" && comicData.coverImage) {
    return comicData.coverImage;
  }

  // Try images array with url property
  if (Array.isArray(comicData.images) && comicData.images.length > 0) {
    const firstImage = comicData.images[0];
    if (typeof firstImage === "object" && firstImage && "url" in firstImage) {
      return (firstImage as { url: string }).url;
    }
    if (typeof firstImage === "string") {
      return firstImage;
    }
  }

  return PLACEHOLDER_COMIC;
}

/**
 * Extract author name from various formats
 */
function extractAuthorName(comicData: Record<string, unknown>): string {
  if (typeof comicData.author === "string") return comicData.author;
  if (typeof comicData.author === "object" && comicData.author && "name" in comicData.author) {
    return (comicData.author as { name: string }).name;
  }
  return "Unknown Author";
}

/**
 * Extract artist name from various formats
 */
function extractArtistName(comicData: Record<string, unknown>): null | string {
  if (typeof comicData.artist === "string") return comicData.artist;
  if (typeof comicData.artist === "object" && comicData.artist && "name" in comicData.artist) {
    return (comicData.artist as { name: string }).name;
  }
  return null;
}

/**
 * Extract type name from various formats
 */
function extractTypeName(comicData: Record<string, unknown>): string {
  if (typeof comicData.type === "string") return comicData.type;
  if (typeof comicData.type === "object" && comicData.type && "name" in comicData.type) {
    return (comicData.type as { name: string }).name;
  }
  return "Manga"; // Default type
}

/**
 * Seeds comics from provided data with validation
 */
/**
 * Normalize text for matching (lowercase, remove special chars, trim)
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();
}

// --- Helper: Transform and validate comics ---
function transformAndValidateComics(
  rawComics: unknown[],
  authorMap: Map<string, number>,
  artistMap: Map<string, number>,
  typeMap: Map<string, number>
): { errors: Array<{ comic: unknown; error: string }>; transformedComics: Partial<ComicSeed>[] } {
  const errors: Array<{ comic: unknown; error: string }> = [];
  const transformedComics: Partial<ComicSeed>[] = [];
  for (const rawComic of rawComics as Record<string, unknown>[]) {
    try {
      const coverImage = extractCoverImage(rawComic);
      const authorName = extractAuthorName(rawComic);
      const artistName = extractArtistName(rawComic);
      const typeName = extractTypeName(rawComic);
      const genres = normalizeGenres(rawComic.genres);

      // Get IDs from maps
      const authorId = authorMap.get(authorName);
      if (!authorId) {
        throw new Error(
          `Author "${authorName}" not found in database. Available authors: ${Array.from(authorMap.keys()).join(", ")}`
        );
      }
      const artistId = artistName ? artistMap.get(artistName) : undefined;
      const typeId = typeMap.get(typeName);

      transformedComics.push({
        id: typeof rawComic.id === "number" ? rawComic.id : undefined,
        title: String(rawComic.title || ""),
        slug: String(rawComic.slug || ""),
        description: String(rawComic.description || "No description available"),
        coverImage,
        authorId,
        artistId,
        typeId,
        genres,
        publicationDate: normalizeDateString(rawComic.updatedAt as string),
        status: (rawComic.status as ComicSeed["status"]) || "Ongoing",
        rating:
          typeof rawComic.rating === "string" ? parseFloat(rawComic.rating) || 0 : (rawComic.rating as number) || 0,
        views: (rawComic.views as number) || 0,
      });
    } catch (err) {
      errors.push({
        comic: rawComic,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { transformedComics, errors };
}

export async function seedComics(options: ComicSeederOptions): Promise<ComicSeederResult> {
  const {
    comics: rawComics,
    chapters: allChapters,
    authorMap,
    artistMap,
    typeMap,
    genreMap,
    dryRun = false,
    onProgress,
    downloadConcurrency,
  } = options;

  const comicSlugMap = new Map<string, number>();

  // Use helper for transformation/validation
  const { transformedComics, errors } = transformAndValidateComics(rawComics, authorMap, artistMap, typeMap);

  // --- Helper: Detect duplicates and validate unique comics ---
  function detectAndValidateUniqueComics(
    transformedComics: Partial<ComicSeed>[],
    _errors: Array<{ comic: unknown; error: string }>
  ): {
    duplicateResult: { summary: { duplicateCount: number }; uniqueComics: Partial<ComicSeed>[] };
    validComics: ComicSeed[];
  } {
    // Use slug for duplicate detection
    const seen = new Set<string>();
    const uniqueComics: Partial<ComicSeed>[] = [];
    let duplicateCount = 0;
    for (const comic of transformedComics) {
      const slug = comic.slug as string;
      if (slug && seen.has(slug)) {
        duplicateCount++;
        continue;
      }
      if (slug) seen.add(slug);
      uniqueComics.push(comic);
    }
    // Validate unique comics
    const validComics: ComicSeed[] = [];
    for (const uniqueComic of uniqueComics) {
      // Assume ComicSeedSchema.safeParse is not needed, as schema import was removed
      validComics.push(uniqueComic as ComicSeed);
    }
    return { validComics, duplicateResult: { uniqueComics, summary: { duplicateCount } } };
  }

  // Use helper for duplicate detection and validation
  const { validComics, duplicateResult } = detectAndValidateUniqueComics(transformedComics, errors);

  if (validComics.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawComics.length,
      duplicatesSkipped: duplicateResult.summary.duplicateCount,
      errors,
      duplicateReport: duplicateResult,
      comicSlugMap,
    };
  }

  // Download cover images if not dry run
  if (!dryRun) {
    await downloadCoverImagesForComics(validComics, onProgress);
  }

  // Report progress before seeding
  onProgress?.(0, validComics.length);

  // Before inserting, filter out comics whose titles already exist in DB
  let itemsToInsert = validComics.map((c) => ({
    title: c.title,
    slug: c.slug,
    description: c.description || "No description available",
    coverImage: c.coverImage || PLACEHOLDER_COMIC,
    status: c.status || "Ongoing",
    publicationDate: new Date(c.publicationDate),
    rating: String(c.rating || 0),
    views: c.views || 0,
    authorId: c.authorId,
    artistId: c.artistId,
    typeId: c.typeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (!dryRun) {
    try {
      const titles = validComics.map((c) => c.title);
      const existing = await db.query.comic.findMany({
        where: (comicRow, { inArray }) => inArray(comicRow.title, titles),
        columns: { title: true },
      });
      const existingTitles = new Set(existing.map((e) => e.title));

      // Filter out any items that would violate the title unique constraint
      const beforeCount = itemsToInsert.length;
      itemsToInsert = itemsToInsert.filter((it) => !existingTitles.has(it.title as string));
      const filtered = beforeCount - itemsToInsert.length;
      if (filtered > 0) {
        // TODO: Replace with logger
        void filtered;
      }
    } catch (err) {
      // TODO: Replace with logger
      void err;
    }
  }

  // Ensure no duplicate titles within the insert batch itself (unique constraint prevents this)
  const seenTitles = new Set<string>();
  const beforeDedup = itemsToInsert.length;
  itemsToInsert = itemsToInsert.filter((it) => {
    const title = String(it.title || "");
    if (!title) return true;
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  });
  const deduped = beforeDedup - itemsToInsert.length;
  if (deduped > 0) {
    // TODO: Replace with logger
    void deduped;
  }

  const result = await seedTableBatched({
    table: comic,
    items: itemsToInsert,
    conflictKeys: [comic.slug],
    updateFields: [
      { name: "title", value: undefined },
      { name: "description", value: undefined },
      { name: "coverImage", value: undefined },
      { name: "status", value: undefined },
      { name: "rating", value: undefined },
      { name: "views", value: undefined },
      { name: "authorId", value: undefined },
      { name: "artistId", value: undefined },
      { name: "typeId", value: undefined },
    ],
    dryRun,
  });

  // Build slug → ID map by querying database (or simulate for dry runs)
  // Also build a comprehensive lookup map with all slug/title variations
  if (!dryRun) {
    const slugs = validComics.map((c) => c.slug);
    const insertedComics = await db.query.comic.findMany({
      where: (comic, { inArray }) => inArray(comic.slug, slugs),
      columns: { id: true, slug: true, title: true },
    });

    for (const c of insertedComics) {
      comicSlugMap.set(c.slug, c.id);
      // Also map normalized slug (without UUID suffix) for chapters using short slugs
      const normalizedSlug = normalizeSlug(c.slug);
      if (normalizedSlug !== c.slug && !comicSlugMap.has(normalizedSlug)) {
        comicSlugMap.set(normalizedSlug, c.id);
      }
      // Add title-based matching (normalized)
      if (c.title) {
        const normalizedTitle = normalizeForMatching(c.title);
        if (!comicSlugMap.has(normalizedTitle)) {
          comicSlugMap.set(normalizedTitle, c.id);
        }
      }
    }

    // Also add ALL raw comic slugs/titles that map to valid comics (for duplicate handling)
    for (const rawComic of rawComics as Record<string, unknown>[]) {
      const rawSlug = String(rawComic.slug || "");
      const rawTitle = String(rawComic.title || "");
      const normalizedRawSlug = normalizeSlug(rawSlug);

      // Find which valid comic this raw comic maps to
      const comicId = comicSlugMap.get(rawSlug) || comicSlugMap.get(normalizedRawSlug);
      if (comicId) {
        // Add all variations
        if (!comicSlugMap.has(rawSlug)) comicSlugMap.set(rawSlug, comicId);
        if (!comicSlugMap.has(normalizedRawSlug)) comicSlugMap.set(normalizedRawSlug, comicId);
        const normalizedTitle = normalizeForMatching(rawTitle);
        if (!comicSlugMap.has(normalizedTitle)) comicSlugMap.set(normalizedTitle, comicId);
      }
    }

    // Seed comic-to-genre relationships
    const genreRelations: { comicId: number; genreId: number }[] = [];
    for (const c of validComics) {
      const comicId = comicSlugMap.get(c.slug);
      if (!comicId) continue;

      const genres = normalizeGenres(c.genres);
      for (const genreName of genres) {
        const genreId = genreMap.get(genreName);
        if (genreId) {
          genreRelations.push({ comicId, genreId });
        }
      }
    }

    if (genreRelations.length > 0) {
      await seedTableBatched({
        table: comicToGenre,
        items: genreRelations,
        conflictKeys: [comicToGenre.comicId, comicToGenre.genreId],
        updateFields: [],
        dryRun,
      });
    }
  } else {
    // Dry run: simulate comicSlugMap with fake IDs for chapter validation
    // Include ALL transformed comics (not just unique) with all slug/title variations
    let fakeId = 1;
    const seenSlugs = new Set<string>();
    const slugToFakeId = new Map<string, number>();

    for (const c of transformedComics) {
      const slug = c.slug as string;
      const title = c.title as string;
      if (!slug) continue;

      // Get existing ID if this slug maps to one already, else create new
      const normalizedSlug = normalizeSlug(slug);
      let id = slugToFakeId.get(normalizedSlug);
      if (!id) {
        id = fakeId++;
        slugToFakeId.set(normalizedSlug, id);
      }

      // Add all variations for this comic
      if (!seenSlugs.has(slug)) {
        comicSlugMap.set(slug, id);
        seenSlugs.add(slug);
      }
      if (!seenSlugs.has(normalizedSlug)) {
        comicSlugMap.set(normalizedSlug, id);
        seenSlugs.add(normalizedSlug);
      }
      if (title) {
        const normalizedTitle = normalizeForMatching(title);
        if (!seenSlugs.has(normalizedTitle)) {
          comicSlugMap.set(normalizedTitle, id);
          seenSlugs.add(normalizedTitle);
        }
      }
    }
  }

  // Report completion
  onProgress?.(validComics.length, validComics.length);

  // ===== SEED CHAPTERS FOR ALL COMICS =====
  // Pass all chapters to chapter-seeder - it will match using comicSlugMap
  // The comicSlugMap now contains all slug/title variations
  const allChaptersTyped = allChapters as Record<string, unknown>[];

  // Seed all chapters (chapter-seeder will filter by comicSlugMap)
  let chaptersResult: ChapterSeederResult | undefined;
  if (allChaptersTyped.length > 0) {
    chaptersResult = await seedChapters({
      chapters: allChaptersTyped,
      comicSlugMap,
      dryRun,
      downloadConcurrency,
    });
  }

  // Skipped = duplicates + any items that weren't inserted due to conflicts (not errors)
  const actualSkipped = duplicateResult.summary.duplicateCount;

  return {
    success: true,
    seeded: result.inserted,
    skipped: actualSkipped,
    duplicatesSkipped: duplicateResult.summary.duplicateCount,
    errors,
    duplicateReport: duplicateResult,
    comicSlugMap,
    chaptersResult,
  };
}

export default seedComics;
