import { z } from "zod";

// ========== USER SCHEMAS ==========

export const UserSeedSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  image: z.string().optional(),
  role: z.enum(["user", "admin", "moderator"]).optional().default("user"),
});

export type UserSeed = z.infer<typeof UserSeedSchema>;

// ========== AUTHOR/ARTIST SCHEMAS ==========

export const AuthorSeedSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const ArtistSeedSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type AuthorSeed = z.infer<typeof AuthorSeedSchema>;
export type ArtistSeed = z.infer<typeof ArtistSeedSchema>;

// ========== GENRE/TYPE SCHEMAS ==========

export const GenreSeedSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  slug: z.string().optional(), // Auto-generated from name if not provided
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const TypeSeedSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type GenreSeed = z.infer<typeof GenreSeedSchema>;
export type TypeSeed = z.infer<typeof TypeSeedSchema>;

// ========== COMIC SCHEMAS ==========

export const ComicSeedSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  authorId: z.number().int(),
  artistId: z.number().int().optional(),
  typeId: z.number().int().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
  genres: z.array(z.union([z.string(), z.object({ name: z.string() })])).optional(),
  publicationDate: z.string().min(1),
  status: z.enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Coming Soon"]).optional(),
  views: z.number().int().optional(),
  rating: z.number().optional(),
});

export type ComicSeed = z.infer<typeof ComicSeedSchema>;

// ========== CHAPTER SCHEMAS ==========

export const ChapterSeedSchema = z.object({
  id: z.number().int().optional(),
  comicId: z.number().int(),
  title: z.string().min(1),
  slug: z.string().min(1),
  chapterNumber: z.number().int().optional(),
  images: z.array(z.string()),
  releaseDate: z.string().optional(),
  content: z.string().optional(),
  views: z.number().int().optional(),
});

export type ChapterSeed = z.infer<typeof ChapterSeedSchema>;

// ========== RAW DATA SCHEMAS (for incoming JSON) ==========

/**
 * Flexible schema for raw chapter data from external sources
 * Maps various field names to standard fields
 */
export const RawChapterSchema = z.object({
  comicslug: z.string().optional(),
  comictitle: z.string().optional(),
  comicId: z.number().int().optional(),
  chaptername: z.string().optional(),
  title: z.string().optional(),
  chapterslug: z.string().optional(),
  slug: z.string().optional(),
  chapterNumber: z.number().int().optional(),
  image_urls: z.array(z.string()).optional(),
  // Accept both string[] and {url: string}[] formats for images
  images: z.array(z.union([z.string(), z.object({ url: z.string() })])).optional(),
  updated_at: z.string().optional(),
  releaseDate: z.string().optional(),
  url: z.string().optional(),
  // Support nested comic object with slug/title
  comic: z
    .object({
      slug: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
});

export type RawChapter = z.infer<typeof RawChapterSchema>;

// ========== SEED CONFIGURATION SCHEMAS ==========

export const SeedConfigSchema = z.object({
  batchSize: z.number().int().positive().optional().default(100),
  downloadConcurrency: z.number().int().positive().optional().default(5),
  maxImageSize: z.number().int().positive().optional().default(5242880), // 5MB
  dryRun: z.boolean().optional().default(false),
  skipImages: z.boolean().optional().default(false),
  verbose: z.boolean().optional().default(false),
});

export type SeedConfig = z.infer<typeof SeedConfigSchema>;

export const SeedManifestSchema = z.object({
  version: z.string().optional().default("1.0"),
  timestamp: z.string().datetime().optional(),
  entities: z.array(z.enum(["users", "authors", "artists", "genres", "types", "comics", "chapters"])).optional(),
  config: SeedConfigSchema.optional(),
});

export type SeedManifest = z.infer<typeof SeedManifestSchema>;

// ========== IMAGE URL UTILITIES ==========

const allowedImageFormats = ["jpeg", "jpg", "png", "webp", "avif", "gif", "svg"];

/**
 * Normalize an image URL to ensure it has a leading slash or is absolute
 */
export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  url = url.trim();
  if (url.startsWith("/")) return url;
  if (/^https?:\/\//.test(url)) return url;
  return "/" + url;
}

/**
 * Normalize an array of image URLs
 */
export function normalizeImageArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeImageUrl).filter(Boolean);
}

/**
 * Validate that a URL points to an allowed image format
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
  return ext ? allowedImageFormats.includes(ext) : false;
}

/**
 * Filter an array to only valid image URLs
 */
export function filterValidImageUrls(urls: string[]): string[] {
  return urls.filter(isValidImageUrl);
}

// ========== DATE UTILITIES ==========

/**
 * Normalize a date string to ISO format
 * Returns current date if invalid
 */
export function normalizeDateString(dateStr: null | string | undefined): string {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "" || dateStr === "null") {
    return new Date().toISOString();
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  return d.toISOString();
}

// ========== GENRE UTILITIES ==========

/**
 * Normalize genre data from various formats to string array
 */
export function normalizeGenres(genres: unknown): string[] {
  if (!genres) return [];
  if (!Array.isArray(genres)) return [];

  return genres
    .map((g) => {
      if (typeof g === "string") return g;
      if (g && typeof g === "object" && "name" in g && typeof (g as { name: unknown }).name === "string") {
        return (g as { name: string }).name;
      }
      if (g && typeof g === "object" && "id" in g && typeof (g as { id: unknown }).id === "string") {
        return (g as { id: string }).id;
      }
      return "";
    })
    .filter(Boolean);
}

// ========== SLUG UTILITIES ==========

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .trim();
}
