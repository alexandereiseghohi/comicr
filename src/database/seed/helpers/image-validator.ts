/**
 * @file imageValidator.ts
 * @description Validates image URLs including format, reachability, content-type, and size
 * @author ComicWise Team
 * @date 2026-02-01
 */

// Default max image size: 5MB

export interface ImageValidationResult {
  contentType?: string;
  error?: string;
  format?: string;
  size?: number;
  url: string;
  valid: boolean;
}

/**
 * Allowed image formats for seeding
 */
const ALLOWED_FORMATS = ["jpeg", "jpg", "png", "webp", "avif", "gif"];

/**
 * Allowed MIME types for image validation
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/**
 * Validate image URL format
 * @param url - Image URL to validate
 * @returns Format string or null if invalid
 */
export function validateImageFormat(url: string): null | string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    const extension = pathname.split(".").pop();

    if (!extension || !ALLOWED_FORMATS.includes(extension)) {
      return null;
    }

    return extension;
  } catch {
    return null;
  }
}

/**
 * Check if URL is reachable and get image metadata
 * @param url - Image URL to check
 * @param maxSizeBytes - Maximum allowed file size in bytes
 * @returns Image metadata or error
 */
export async function checkImageReachability(
  url: string,
  maxSizeBytes: number = 5242880 // 5MB default
): Promise<ImageValidationResult> {
  try {
    // Make HEAD request first to check headers without downloading
    const headResponse = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!headResponse.ok) {
      return {
        valid: false,
        url,
        error: `HTTP ${headResponse.status}: ${headResponse.statusText}`,
      };
    }

    const contentType = headResponse.headers.get("content-type");
    const contentLength = headResponse.headers.get("content-length");

    // Validate content type
    if (!contentType || !ALLOWED_MIME_TYPES.some((mime) => contentType.includes(mime))) {
      return {
        valid: false,
        url,
        error: `Invalid content-type: ${contentType}`,
      };
    }

    // Validate size
    const size = contentLength ? parseInt(contentLength, 10) : 0;
    if (size > maxSizeBytes) {
      return {
        valid: false,
        url,
        error: `Image too large: ${(size / 1024 / 1024).toFixed(2)}MB (max: ${(maxSizeBytes / 1024 / 1024).toFixed(
          2
        )}MB)`,
        size,
      };
    }

    return {
      valid: true,
      url,
      size,
      contentType,
      format: validateImageFormat(url) || undefined,
    };
  } catch (error) {
    return {
      valid: false,
      url,
      error: error instanceof Error ? error.message : "Unknown error during fetch",
    };
  }
}

/**
 * Get image dimensions by downloading and parsing headers
 * @param url - Image URL
 * @returns Width and height in pixels, or null if unable to determine
 */
export async function getImageSize(url: string): Promise<{ height: number; width: number } | null> {
  try {
    // For most images, we can get dimensions from a partial download
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    const view = new DataView(buffer);

    // Try to parse common image formats
    // JPEG
    if (view.getUint8(0) === 0xff && view.getUint8(1) === 0xd8) {
      let offset = 2;
      while (offset < view.byteLength) {
        if (view.getUint8(offset) !== 0xff) break;
        const marker = view.getUint8(offset + 1);
        if (marker === 0xc0 || marker === 0xc2) {
          // Start of Frame marker
          const height = view.getUint16(offset + 5);
          const width = view.getUint16(offset + 7);
          return { width, height };
        }
        offset += 2 + view.getUint16(offset + 2);
      }
    }

    // PNG
    if (
      view.getUint8(0) === 0x89 &&
      view.getUint8(1) === 0x50 &&
      view.getUint8(2) === 0x4e &&
      view.getUint8(3) === 0x47
    ) {
      const width = view.getUint32(16);
      const height = view.getUint32(20);
      return { width, height };
    }

    // For other formats, we'd need image processing library
    return null;
  } catch {
    return null;
  }
}

/**
 * Comprehensive image validation
 * @param url - Image URL to validate
 * @param maxSizeBytes - Maximum allowed file size
 * @param checkDimensions - Whether to fetch and check image dimensions
 * @returns Validation result with metadata
 */
export async function validateImage(
  url: string,
  maxSizeBytes?: number,
  checkDimensions: boolean = false
): Promise<ImageValidationResult> {
  // 1. Validate URL format
  const format = validateImageFormat(url);
  if (!format) {
    return {
      valid: false,
      url,
      error: `Invalid image format. Allowed: ${ALLOWED_FORMATS.join(", ")}`,
    };
  }

  // 2. Check reachability and headers
  const reachabilityResult = await checkImageReachability(url, maxSizeBytes);
  if (!reachabilityResult.valid) {
    return reachabilityResult;
  }

  // 3. Optionally check dimensions
  if (checkDimensions) {
    const dimensions = await getImageSize(url);
    if (!dimensions) {
      return {
        ...reachabilityResult,
        valid: true,
        error: "Could not determine image dimensions",
      };
    }
  }

  return reachabilityResult;
}

/**
 * Batch validate multiple image URLs
 * @param urls - Array of image URLs
 * @param maxSizeBytes - Maximum allowed file size per image
 * @param concurrency - Number of concurrent validations
 * @returns Array of validation results
 */
export async function validateImages(
  urls: string[],
  maxSizeBytes?: number,
  concurrency: number = 5
): Promise<ImageValidationResult[]> {
  const results: ImageValidationResult[] = [];
  const queue = [...urls];

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const batchResults = await Promise.all(batch.map((url) => validateImage(url, maxSizeBytes)));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Get summary statistics from validation results
 * @param results - Array of validation results
 * @returns Summary object
 */
export function getValidationSummary(results: ImageValidationResult[]) {
  const total = results.length;
  const valid = results.filter((r) => r.valid).length;
  const invalid = total - valid;
  const totalSize = results.filter((r) => r.size).reduce((sum, r) => sum + (r.size || 0), 0);

  const errorTypes = results
    .filter((r) => !r.valid && r.error)
    .reduce(
      (acc, r) => {
        const errorKey = r.error!.split(":")[0] || "Unknown";
        acc[errorKey] = (acc[errorKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  return {
    total,
    valid,
    invalid,
    validPercentage: ((valid / total) * 100).toFixed(2),
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    errorTypes,
  };
}
