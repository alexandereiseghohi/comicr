/**
 * Storage Provider Types
 * @description Type definitions for the multi-provider storage abstraction
 */

export type StorageProviderType = "cloudinary" | "imagekit" | "local" | "s3";

export interface UploadOptions {
  /** File access level */
  access?: "private" | "public";
  /** Content type override */
  contentType?: string;
  /** Custom filename (without extension) */
  filename?: string;
  /** Target folder/path within the storage */
  folder?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  /** Content type */
  contentType: string;
  /** Unique file key/path for future operations */
  key: string;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
  /** File size in bytes */
  size: number;
  /** Success indicator */
  success: true;
  /** Public URL of the uploaded file */
  url: string;
}

export interface UploadError {
  code?: string;
  error: string;
  success: false;
}

export type UploadResponse = UploadError | UploadResult;

export interface DeleteOptions {
  /** Delete file permanently (no recovery) */
  permanent?: boolean;
}

export interface DeleteResult {
  error?: string;
  success: boolean;
}

export interface GetUrlOptions {
  /** Force download instead of inline display */
  download?: boolean;
  /** Custom filename for download */
  downloadFilename?: string;
  /** URL expiration time in seconds (for signed URLs) */
  expiresIn?: number;
}

export interface ExistsResult {
  exists: boolean;
  lastModified?: Date;
  size?: number;
}

/**
 * Storage Provider Interface
 * All storage implementations must implement this interface
 */
export interface StorageProvider {
  /**
   * Delete a file from storage
   * @param key - File key/path returned from upload
   * @param options - Delete options
   */
  delete(key: string, options?: DeleteOptions): Promise<DeleteResult>;

  /**
   * Check if a file exists
   * @param key - File key/path
   */
  exists(key: string): Promise<ExistsResult>;

  /**
   * Get a signed/presigned URL for private file access
   * @param key - File key/path
   * @param expiresIn - Expiration time in seconds
   */
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Get the public URL for a file
   * @param key - File key/path
   * @param options - URL options
   */
  getUrl(key: string, options?: GetUrlOptions): Promise<string>;

  /** Provider name for identification */
  readonly name: StorageProviderType;

  /**
   * Upload a file to storage
   * @param file - File buffer or stream
   * @param filename - Original filename with extension
   * @param options - Upload options
   */
  upload(file: Blob | Buffer | ReadableStream, filename: string, options?: UploadOptions): Promise<UploadResponse>;
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
  if (contentType.startsWith("application/pdf") || contentType.includes("document")) return "document";
  return "other";
}

/**
 * Validate file against size and type limits
 */
export function validateFile(size: number, contentType: string): { error: string; valid: false } | { valid: true } {
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
