/**
 * @file chapter-seeder.ts
 * @description Seeds chapters from JSON files with validation and full image download
 */

import { downloadAndSaveImage } from "@/lib/image-helper";
import { seedTableBatched } from "@/lib/seed-helpers";
import { normalizeDateString, RawChapterSchema } from "@/lib/validations/seed";

import { db } from "../../db";
import { chapter, chapterImage } from "../../schema";
import { chunkArray, processDuplicateImage } from "../helpers";
import {
  CHAPTERS_IMAGE_DIR,
  PLACEHOLDER_CHAPTER,
  SEED_DOWNLOAD_CONCURRENCY_VALUE,
} from "../seed-config";

export interface ChapterSeederOptions {
  /** Array of chapters to seed */
  chapters: unknown[];
  /** Map of comic slug → comic ID */
  comicSlugMap: Map<string, number>;
  /** Download concurrency (default: 10) */
  downloadConcurrency?: number;
  /** Skip database writes if true */
  dryRun?: boolean;
  /** Progress callback */
  onProgress?: (current: number, total: number, phase: string) => void;
}

export interface ChapterSeederResult {
  errors: Array<{ chapter: unknown; error: string }>;
  imagesDeduplicated: number;
  imagesDownloaded: number;
  imagesFailed: number;
  seeded: number;
  skipped: number;
  success: boolean;
}

interface TransformedChapter {
  chapterNumber: number;
  comicId: number;
  comicSlug: string;
  images: string[];
  releaseDate: string;
  slug: string;
  title: string;
  url?: string;
}

/**
 * Extract chapter number from chapter name (e.g., "Chapter 273" → 273)
 */
function extractChapterNumber(name: string | undefined, fallback: number): number {
  if (!name) return fallback;

  // Try to extract number from "Chapter X" pattern
  const match = name.match(/chapter\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Try to extract any number from the name
  const numMatch = name.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1], 10);
  }

  return fallback;
}

/**
 * Extract images from various formats
 */
function extractImages(chapterData: Record<string, unknown>): string[] {
  // Try images array with url property
  if (Array.isArray(chapterData.images)) {
    return chapterData.images
      .map((img) => {
        if (typeof img === "string") return img;
        if (typeof img === "object" && img && "url" in img) {
          return (img as { url: string }).url;
        }
        return null;
      })
      .filter((url): url is string => url !== null && url.length > 0);
  }

  // Try image_urls array
  if (Array.isArray(chapterData.image_urls)) {
    return chapterData.image_urls.filter(
      (url): url is string => typeof url === "string" && url.length > 0
    );
  }

  return [];
}

/**
 * Generate chapter slug from comic slug and chapter number
 */
function generateChapterSlug(comicSlug: string, chapterNumber: number): string {
  return `${comicSlug}-chapter-${chapterNumber}`;
}

/**
 * Download chapter images with concurrency limit
 */
async function downloadChapterImages(
  images: string[],
  chapterSlug: string,
  concurrency: number,
  onProgress?: (downloaded: number, total: number) => void
): Promise<{ deduplicated: number; downloadedPaths: string[]; failed: number }> {
  const downloadedPaths: string[] = [];
  let failed = 0;
  let deduplicated = 0;
  let downloaded = 0;

  const destDir = `${CHAPTERS_IMAGE_DIR}/${chapterSlug}`;

  // Process in batches for concurrency control
  const batches = chunkArray(images, concurrency);

  for (const batch of batches) {
    const results = await Promise.all(
      batch.map(async (url, batchIndex) => {
        const pageNumber = downloaded + batchIndex + 1;
        const filename = `page-${String(pageNumber).padStart(3, "0")}.webp`;

        try {
          const localPath = await downloadAndSaveImage({
            url,
            destDir,
            filename,
            fallback: PLACEHOLDER_CHAPTER,
          });

          // Check for duplicates using content hash
          const dedupResult = await processDuplicateImage(localPath);
          if (dedupResult.isDuplicate && dedupResult.symlinkCreated) {
            deduplicated++;
          }

          return { success: true, path: localPath };
        } catch {
          failed++;
          return { success: false, path: PLACEHOLDER_CHAPTER };
        }
      })
    );

    downloadedPaths.push(...results.map((r) => r.path));
    downloaded += batch.length;
    onProgress?.(downloaded, images.length);
  }

  return { downloadedPaths, failed, deduplicated };
}

/**
 * Normalize a slug by removing UUID suffix (e.g., "comic-name-abc123" → "comic-name")
 */
function normalizeSlug(slug: string): string {
  return slug.replace(/-[a-f0-9]{8}$/, "");
}

/**
 * Normalize text for title matching (lowercase, remove special chars, trim)
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Seeds chapters from provided data with validation and image download
 */
export async function seedChapters(options: ChapterSeederOptions): Promise<ChapterSeederResult> {
  const {
    chapters: rawChapters,
    comicSlugMap,
    dryRun = false,
    onProgress,
    downloadConcurrency = SEED_DOWNLOAD_CONCURRENCY_VALUE || 10,
  } = options;

  const errors: Array<{ chapter: unknown; error: string }> = [];
  const validChapters: TransformedChapter[] = [];
  let totalImagesDownloaded = 0;
  let totalImagesFailed = 0;
  let totalImagesDeduplicated = 0;

  // Transform and validate chapters
  let chapterIndex = 0;
  for (const rawChapter of rawChapters as Record<string, unknown>[]) {
    chapterIndex++;

    // Extract comic slug and title from nested object or direct field
    let comicSlug: string | undefined;
    let comicTitle: string | undefined;

    if (typeof rawChapter.comicslug === "string") {
      comicSlug = rawChapter.comicslug;
    }
    if (typeof rawChapter.comictitle === "string") {
      comicTitle = rawChapter.comictitle;
    }
    if (typeof rawChapter.comic === "object" && rawChapter.comic) {
      const comicObj = rawChapter.comic as { slug?: string; title?: string };
      if (comicObj.slug) comicSlug = comicSlug || comicObj.slug;
      if (comicObj.title) comicTitle = comicTitle || comicObj.title;
    }

    if (!comicSlug && !comicTitle) {
      errors.push({
        chapter: rawChapter,
        error: "Missing comic slug and title",
      });
      continue;
    }

    // Try multiple strategies to find comic ID from map
    let comicId: number | undefined;

    // 1. Direct slug match
    if (comicSlug) {
      comicId = comicSlugMap.get(comicSlug);
    }
    // 2. Normalized slug match (strip UUID)
    if (!comicId && comicSlug) {
      comicId = comicSlugMap.get(normalizeSlug(comicSlug));
    }
    // 3. Title match
    if (!comicId && comicTitle) {
      comicId = comicSlugMap.get(normalizeForMatching(comicTitle));
    }

    if (!comicId) {
      errors.push({
        chapter: rawChapter,
        error: `Comic not found: ${comicSlug || comicTitle}`,
      });
      continue;
    }

    // Validate with flexible schema
    const parsed = RawChapterSchema.safeParse(rawChapter);
    if (!parsed.success) {
      errors.push({
        chapter: rawChapter,
        error: parsed.error.message,
      });
      continue;
    }

    // Extract chapter data
    const chapterNumber = extractChapterNumber(
      parsed.data.chaptername || parsed.data.title,
      parsed.data.chapterNumber || chapterIndex
    );

    const title = parsed.data.title || parsed.data.chaptername || `Chapter ${chapterNumber}`;

    // Use comic slug for chapter slug generation, fallback to normalized title
    const comicSlugForChapter =
      comicSlug || normalizeForMatching(comicTitle || "unknown").replaceAll(/\s+/g, "-");
    const slug =
      parsed.data.chapterslug ||
      parsed.data.slug ||
      generateChapterSlug(comicSlugForChapter, chapterNumber);

    const images = extractImages(rawChapter);
    const releaseDate = normalizeDateString(parsed.data.updated_at || parsed.data.releaseDate);

    validChapters.push({
      comicId,
      comicSlug: comicSlugForChapter,
      title,
      slug,
      chapterNumber,
      releaseDate,
      url: rawChapter.url as string | undefined,
      images,
    });
  }

  if (validChapters.length === 0) {
    return {
      success: errors.length === 0,
      seeded: 0,
      skipped: rawChapters.length,
      imagesDownloaded: 0,
      imagesFailed: 0,
      imagesDeduplicated: 0,
      errors,
    };
  }

  onProgress?.(0, validChapters.length, "chapters");

  // Download images for each chapter (if not dry run)
  const chapterImageMap = new Map<string, string[]>();

  if (!dryRun) {
    let processedChapters = 0;

    for (const chapterData of validChapters) {
      if (chapterData.images.length > 0) {
        const { downloadedPaths, failed, deduplicated } = await downloadChapterImages(
          chapterData.images,
          chapterData.slug,
          downloadConcurrency,
          (downloaded, total) => {
            onProgress?.(
              processedChapters,
              validChapters.length,
              `Downloading images for ${chapterData.slug}: ${downloaded}/${total}`
            );
          }
        );

        chapterImageMap.set(chapterData.slug, downloadedPaths);
        totalImagesDownloaded += downloadedPaths.length - failed;
        totalImagesFailed += failed;
        totalImagesDeduplicated += deduplicated;
      }

      processedChapters++;
      onProgress?.(processedChapters, validChapters.length, "chapters");
    }
  }

  // Seed chapters to database
  const result = await seedTableBatched({
    table: chapter,
    items: validChapters.map((c) => ({
      comicId: c.comicId,
      title: c.title,
      slug: c.slug,
      chapterNumber: c.chapterNumber,
      releaseDate: new Date(c.releaseDate),
      url: c.url,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    conflictKeys: [chapter.comicId, chapter.chapterNumber],
    updateFields: [
      { name: "title", value: undefined },
      { name: "slug", value: undefined },
      { name: "releaseDate", value: undefined },
      { name: "url", value: undefined },
    ],
    dryRun,
  });

  // Seed chapter images
  if (!dryRun && chapterImageMap.size > 0) {
    // Get chapter IDs
    const slugs = validChapters.map((c) => c.slug);
    const insertedChapters = await db.query.chapter.findMany({
      where: (chapter, { inArray }) => inArray(chapter.slug, slugs),
      columns: { id: true, slug: true },
    });

    const chapterIdMap = new Map<string, number>();
    for (const c of insertedChapters) {
      chapterIdMap.set(c.slug, c.id);
    }

    // Build image records
    const imageRecords: { chapterId: number; imageUrl: string; pageNumber: number }[] = [];

    for (const [slug, imagePaths] of chapterImageMap) {
      const chapterId = chapterIdMap.get(slug);
      if (!chapterId) continue;

      for (const [index, imageUrl] of imagePaths.entries()) {
        imageRecords.push({
          chapterId,
          imageUrl,
          pageNumber: index + 1,
        });
      }
    }

    if (imageRecords.length > 0) {
      await seedTableBatched({
        table: chapterImage,
        items: imageRecords,
        conflictKeys: [chapterImage.chapterId, chapterImage.pageNumber],
        updateFields: [{ name: "imageUrl", value: undefined }],
        dryRun,
      });
    }
  }

  onProgress?.(validChapters.length, validChapters.length, "complete");

  // Calculate skipped: total input - (inserted + errors)
  // Skipped = items that weren't processed due to conflicts, not due to validation errors
  const actualSkipped = (rawChapters as unknown[]).length - result.inserted - errors.length;

  return {
    success: true,
    seeded: result.inserted,
    skipped: actualSkipped > 0 ? actualSkipped : 0,
    imagesDownloaded: totalImagesDownloaded,
    imagesFailed: totalImagesFailed,
    imagesDeduplicated: totalImagesDeduplicated,
    errors,
  };
}

export default seedChapters;
