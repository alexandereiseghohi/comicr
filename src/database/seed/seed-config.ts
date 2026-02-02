import path from "node:path";

import {
  SEED_BATCH_SIZE,
  SEED_DOWNLOAD_CONCURRENCY,
  SEED_MAX_IMAGE_SIZE_BYTES,
  SEED_TIMEOUT_MS,
  CUSTOM_PASSWORD as VALIDATED_CUSTOM_PASSWORD,
  SEED_API_KEY as VALIDATED_SEED_API_KEY,
} from "@/lib/env";

// Environment-validated configuration
export const SEED_DOWNLOAD_CONCURRENCY_VALUE = SEED_DOWNLOAD_CONCURRENCY || 10;
export const SEED_MAX_IMAGE_SIZE_BYTES_VALUE = SEED_MAX_IMAGE_SIZE_BYTES || 5242880;
export const SEED_BATCH_SIZE_VALUE = SEED_BATCH_SIZE || 100;
export const SEED_TIMEOUT_MS_VALUE = SEED_TIMEOUT_MS || 30000;
export const SEED_API_KEY = VALIDATED_SEED_API_KEY || "";
export const CUSTOM_PASSWORD = VALIDATED_CUSTOM_PASSWORD;

// Placeholder images
export const PLACEHOLDER_COMIC = "/images/placeholder-comic.jpg";
export const PLACEHOLDER_USER = "/images/shadcn.jpg";
export const PLACEHOLDER_CHAPTER = "/images/placeholder-chapter.png";
export const PLACEHOLDER_AUTHOR = "/images/placeholder-author.png";
export const PLACEHOLDER_ARTIST = "/images/placeholder-artist.png";

// Image directories (relative to public/ - do NOT include "public/" prefix)
export const COMICS_COVER_DIR = "comics/covers";
export const CHAPTERS_IMAGE_DIR = "comics/chapters";
export const AVATARS_IMAGE_DIR = "images/avatars";
export const AUTHORS_IMAGE_DIR = "images/authors";
export const ARTISTS_IMAGE_DIR = "images/artists";

// Report output directory
export const REPORT_DIR = "data/seed-reports";

// Allowed image formats
export const ALLOWED_IMAGE_FORMATS = ["jpeg", "jpg", "png", "webp", "avif"];

// Data source directory
export const DATA_DIR = path.resolve("data/seed-source");

// Batch sizes by entity type
export const BATCH_SIZE = SEED_BATCH_SIZE;
export const BATCH_SIZE_USERS = 50;
export const BATCH_SIZE_COMICS = 100;
export const BATCH_SIZE_CHAPTERS = 200;
export const BATCH_SIZE_IMAGES = 500;

// Data source files
export const DATA_FILES = {
  users: ["users.json"],
  comics: ["comics.json", "comicsdata1.json", "comicsdata2.json"],
  chapters: ["chapters.json", "chaptersdata1.json", "chaptersdata2.json"],
} as const;
