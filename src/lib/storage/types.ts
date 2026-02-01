/**
 * Storage Provider Types
 * @description Type definitions for the multi-provider storage abstraction
 */

export type StorageProviderType = "local" | "s3" | "imagekit" | "cloudinary";

export interface UploadOptions {
  /** Target folder/path within the storage */
  folder?: string;
  /** Custom filename (without extension) */
  filename?: string;
  /** File access level */
  access?: "public" | "private";
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Content type override */
  contentType?: string;
}

export interface UploadResult {
  /** Success indicator */
  success: true;
  /** Public URL of the uploaded file */
  url: string;
  /** Unique file key/path for future operations */
  key: string;
  /** File size in bytes */
  size: number;
  /** Content type */
  contentType: string;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

export interface UploadError {
  success: false;
  error: string;
  code?: string;
}

export type UploadResponse = UploadResult | UploadError;

export interface DeleteOptions {
  /** Delete file permanently (no recovery) */
  permanent?: boolean;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface GetUrlOptions {
  /** URL expiration time in seconds (for signed URLs) */
  expiresIn?: number;
  /** Force download instead of inline display */
  download?: boolean;
  /** Custom filename for download */
  downloadFilename?: string;
}

export interface ExistsResult {
  exists: boolean;
  size?: number;
  lastModified?: Date;
}

/**
 * Storage Provider Interface
 * All storage implementations must implement this interface
 */
export interface StorageProvider {
  /** Provider name for identification */
  readonly name: StorageProviderType;

  /**
   * Upload a file to storage
   * @param file - File buffer or stream
   * @param filename - Original filename with extension
   * @param options - Upload options
   */
  upload(
    file: Buffer | Blob | ReadableStream,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResponse>;

  /**
   * Delete a file from storage
   * @param key - File key/path returned from upload
   * @param options - Delete options
   */
  delete(key: string, options?: DeleteOptions): Promise<DeleteResult>;

  /**
   * Get the public URL for a file
   * @param key - File key/path
   * @param options - URL options
   */
  getUrl(key: string, options?: GetUrlOptions): Promise<string>;

  /**
   * Get a signed/presigned URL for private file access
   * @param key - File key/path
   * @param expiresIn - Expiration time in seconds
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Check if a file exists
   * @param key - File key/path
   */
  exists(key: string): Promise<ExistsResult>;
}

/**
 * File size limits by type (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 50 * 1024 * 1024, // 50MB
  other: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Allowed file types by category
 */
export const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  document: ["application/pdf", "application/msword"],
} as const;

/**
 * Get file category from content type
 */
export function getFileCategory(contentType: string): keyof typeof FILE_SIZE_LIMITS {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("application/pdf") || contentType.includes("document"))
    return "document";
  return "other";
}

/**
 * Validate file against size and type limits
 */
export function validateFile(
  size: number,
  contentType: string
): { valid: true } | { valid: false; error: string } {
  const category = getFileCategory(contentType);
  const maxSize = FILE_SIZE_LIMITS[category];

  if (size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File size exceeds ${maxMB}MB limit for ${category} files` };
  }

  // Check if content type is in allowed list (only for image category for now)
  if (category === "image" && !ALLOWED_FILE_TYPES.image.includes(contentType as never)) {
    return { valid: false, error: `File type ${contentType} is not allowed` };
  }

  return { valid: true };
}
