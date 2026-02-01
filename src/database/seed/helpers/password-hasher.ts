/**
 * @file password-hasher.ts
 * @description Bcrypt password hasher for seeded users
 * @author ComicWise Team
 * @date 2026-02-01
 */

import bcrypt from "bcryptjs";

/**
 * Hash password using bcrypt with 10 rounds (recommended for seed performance)
 * @param password - Plain text password to hash
 * @returns Bcrypt hash ($2b$10$...)
 */
export async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 10; // ~100ms per hash, good balance for seeding
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against bcrypt hash (for testing/validation)
 * @param password - Plain text password
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
