import path from "path";

export const SEED_DOWNLOAD_CONCURRENCY = parseInt(process.env.SEED_DOWNLOAD_CONCURRENCY || "5", 10);
export const SEED_MAX_IMAGE_SIZE_BYTES = parseInt(
  process.env.SEED_MAX_IMAGE_SIZE_BYTES || "5242880",
  10
);
export const SEED_API_KEY = process.env.SEED_API_KEY || "";
export const CUSTOM_PASSWORD = process.env.CUSTOM_PASSWORD || "";
export const PLACEHOLDER_COMIC = path.resolve("public/placeholder-comic.jpg");
export const PLACEHOLDER_USER = path.resolve("public/shadcn.jpg");
export const ALLOWED_IMAGE_FORMATS = ["jpeg", "jpg", "png", "webp", "avif"];
export const COMICS_COVER_DIR = "public/comics/covers";
export const CHAPTERS_IMAGE_DIR = "public/comics/chapters";
export const BATCH_SIZE = 100;
