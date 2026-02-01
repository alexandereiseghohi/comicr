import {
  SEED_BATCH_SIZE,
  SEED_DOWNLOAD_CONCURRENCY,
  SEED_MAX_IMAGE_SIZE_BYTES,
  SEED_TIMEOUT_MS,
  CUSTOM_PASSWORD as VALIDATED_CUSTOM_PASSWORD,
  SEED_API_KEY as VALIDATED_SEED_API_KEY,
} from "@/lib/env";
import path from "path";

export const SEED_DOWNLOAD_CONCURRENCY_VALUE = SEED_DOWNLOAD_CONCURRENCY;
export const SEED_MAX_IMAGE_SIZE_BYTES_VALUE = SEED_MAX_IMAGE_SIZE_BYTES;
export const SEED_BATCH_SIZE_VALUE = SEED_BATCH_SIZE;
export const SEED_TIMEOUT_MS_VALUE = SEED_TIMEOUT_MS;
export const SEED_API_KEY = VALIDATED_SEED_API_KEY || "";
export const CUSTOM_PASSWORD = VALIDATED_CUSTOM_PASSWORD;
export const PLACEHOLDER_COMIC = path.resolve("public/placeholder-comic.jpg");
export const PLACEHOLDER_USER = path.resolve("public/shadcn.jpg");
export const ALLOWED_IMAGE_FORMATS = ["jpeg", "jpg", "png", "webp", "avif"];
export const COMICS_COVER_DIR = "public/comics/covers";
export const CHAPTERS_IMAGE_DIR = "public/comics/chapters";
export const BATCH_SIZE = SEED_BATCH_SIZE;
