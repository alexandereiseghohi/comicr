import { z } from "zod";

import { ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from "@/lib/storage/types";

/**
 * Upload request schema
 */
export const UploadRequestSchema = z.object({
  /** Target folder for the upload */
  folder: z.string().max(100).optional(),
  /** Custom filename (without extension) */
  filename: z.string().max(200).optional(),
  /** Access level */
  access: z.enum(["public", "private"]).default("public"),
  /** Custom metadata */
  metadata: z.record(z.string(), z.string()).optional(),
});

export type UploadRequest = z.infer<typeof UploadRequestSchema>;

/**
 * File validation schema
 */
export const FileValidationSchema = z.object({
  /** File name */
  name: z.string().min(1, "Filename is required"),
  /** File size in bytes */
  size: z
    .number()
    .positive("File size must be positive")
    .max(FILE_SIZE_LIMITS.other, `File size exceeds maximum of ${FILE_SIZE_LIMITS.other / 1024 / 1024}MB`),
  /** Content type */
  type: z.string().min(1, "Content type is required"),
});

export type FileValidation = z.infer<typeof FileValidationSchema>;

/**
 * Validate file for image uploads specifically
 */
export const ImageFileSchema = FileValidationSchema.extend({
  size: z
    .number()
    .positive()
    .max(FILE_SIZE_LIMITS.image, `Image size exceeds maximum of ${FILE_SIZE_LIMITS.image / 1024 / 1024}MB`),
  type: z
    .string()
    .refine((val) => ALLOWED_FILE_TYPES.image.includes(val as (typeof ALLOWED_FILE_TYPES.image)[number]), {
      message: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP, AVIF",
    }),
});

export type ImageFileValidation = z.infer<typeof ImageFileSchema>;

/**
 * Upload response schema
 */
export const UploadResponseSchema = z.object({
  success: z.literal(true),
  url: z.string().url(),
  key: z.string(),
  size: z.number(),
  contentType: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;

/**
 * Upload error response schema
 */
export const UploadErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

export type UploadError = z.infer<typeof UploadErrorSchema>;

/**
 * Validate a file against upload rules
 */
export function validateUploadFile(
  file: { name: string; size: number; type: string },
  requireImage: boolean = false
): { error: string; valid: false } | { valid: true } {
  try {
    if (requireImage) {
      ImageFileSchema.parse(file);
    } else {
      FileValidationSchema.parse(file);
    }
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { valid: false, error: "Unknown validation error" };
  }
}
