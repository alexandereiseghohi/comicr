/**
 * @file seed-logger.ts
 * @description Structured logging for seeding operations
 * @author ComicWise Team
 * @date 2026-01-30
 */

export function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}
export function logWarning(message: string) {
  console.warn(`⚠️  ${message}`);
}
export function logError(message: string) {
  console.error(`❌ ${message}`);
}
export function logProgress(message: string) {
  console.log(`🔄 ${message}`);
}
