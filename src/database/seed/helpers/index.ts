/**
 * @file index.ts
 * @description Barrel export for all seed helpers
 */

// Logger
export {
  createLogger,
  type LogLevel,
  type ProgressOptions,
  SeedLogger,
  seedLogger,
} from "./logger";

// Password hashing
export { hashPassword, verifyPassword } from "./password-hasher";

// Duplicate detection
export {
  detectDuplicates,
  type DuplicateConflict,
  type DuplicateDetectionResult,
  generateDuplicateReport,
} from "./duplicate-detector";

// Image deduplication
export {
  clearDeduplicationCache,
  createImageSymlink,
  deduplicateImages,
  findDuplicateByHash,
  getDeduplicationStats,
  hashImageFile,
  processDuplicateImage,
} from "./image-deduplicator";

// Image validation
export {
  checkImageReachability,
  getImageSize,
  getValidationSummary,
  type ImageValidationResult,
  validateImage,
  validateImageFormat,
  validateImages,
} from "./image-validator";

// Batch processing
export { chunkArray, processInBatches } from "./batch-processor";

// Report generation
export {
  createReportGenerator,
  type ErrorLog,
  type PhaseReport,
  type SeedReport,
  SeedReportGenerator,
  type SeedSummary,
} from "./report-generator";

// Validation utilities
export { validateAndInsert } from "./validate-and-insert";
