import type { Table } from "drizzle-orm";
import fs from "fs/promises";
import { glob } from "glob";
import { chunk } from "lodash-es";
import path from "path";
import { z } from "zod";
import { Database, db as drizzleDb } from "../database/db";

/**
 * Discover JSON files matching a glob pattern
 * @param pattern Glob pattern (e.g., 'comics*.json', '**\/*.json')
 * @param cwd Working directory for pattern matching (default: process.cwd())
 * @returns Array of absolute file paths
 */
export async function discoverJsonFiles(
  pattern: string,
  cwd: string = process.cwd()
): Promise<string[]> {
  return glob(pattern, { cwd, absolute: true });
}

/**
 * Loads and parses a JSON file, returning the parsed data or throws on error.
 */
export async function loadJsonData<T>(filePath: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Validation failed for ${filePath}: ${result.error}`);
  }
  return result.data;
}

/**
 * Loads and parses a JSON file without validation, returning raw data.
 */
export async function loadJsonRaw<T = unknown>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

/**
 * Load multiple JSON files matching a glob pattern
 * @param pattern Glob pattern (e.g., 'comics*.json', 'data/chapters*.json')
 * @param cwd Working directory for pattern matching (default: process.cwd())
 * @returns Array of { filePath, data } objects
 */
export async function loadJsonPattern<T = unknown>(
  pattern: string,
  cwd: string = process.cwd()
): Promise<Array<{ filePath: string; data: T }>> {
  const files = await glob(pattern, { cwd, absolute: true });
  const results: Array<{ filePath: string; data: T }> = [];

  for (const filePath of files) {
    try {
      const data = await loadJsonRaw<T>(filePath);
      results.push({ filePath, data });
    } catch (error) {
      console.warn(`[SEED] Failed to load ${filePath}:`, error);
    }
  }

  return results;
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load JSON files from an array of possible paths, returning data from all that exist
 */
export async function loadJsonFiles<T = unknown>(
  filePaths: string[],
  basePath: string = process.cwd()
): Promise<Array<{ filePath: string; data: T[] }>> {
  const results: Array<{ filePath: string; data: T[] }> = [];

  for (const file of filePaths) {
    const fullPath = path.resolve(basePath, file);
    try {
      if (await fileExists(fullPath)) {
        const data = await loadJsonRaw<T[]>(fullPath);
        if (Array.isArray(data)) {
          results.push({ filePath: fullPath, data });
        }
      }
    } catch (error) {
      console.warn(`[SEED] Could not load ${file}:`, error);
    }
  }

  return results;
}

/**
 * Merge data arrays from multiple file loads
 */
export function mergeLoadedData<T>(loaded: Array<{ filePath: string; data: T[] }>): T[] {
  return loaded.flatMap((l) => l.data);
}

/**
 * Batched upsert for Drizzle ORM tables.
 * @param table Drizzle table
 * @param items Array of items to upsert
 * @param batchSize Number of items per batch
 * @param conflictKeys Array of keys to use for upsert conflict
 * @param updateFields Array of fields to update on conflict
 * @param dryRun If true, skip actual DB writes
 */
export async function seedTableBatched({
  table,
  items,
  batchSize = 100,
  conflictKeys,
  updateFields,
  db = drizzleDb,
  dryRun = false,
}: {
  table: Table;
  items: Record<string, unknown>[];
  batchSize?: number;
  conflictKeys: import("drizzle-orm/pg-core/indexes").IndexColumn[];
  updateFields: { name: string; value: unknown }[];
  db?: Database;
  dryRun?: boolean;
}): Promise<{ inserted: number; batches: number }> {
  if (!items || items.length === 0) return { inserted: 0, batches: 0 };

  if (dryRun) {
    console.log(
      `[DRY-RUN] Would insert ${items.length} items in ${Math.ceil(
        items.length / batchSize
      )} batches`
    );
    return { inserted: items.length, batches: Math.ceil(items.length / batchSize) };
  }

  // Always update 'updatedAt' to current timestamp for idempotent upsert
  const upsertFields = [
    ...updateFields.filter((col) => col.value !== undefined),
    { name: "updatedAt", value: new Date() },
  ];

  let inserted = 0;
  let batches = 0;

  for (const batch of chunk(items, batchSize)) {
    if (!batch.length) continue;
    try {
      await db
        .insert(table as Table)
        .values(batch)
        .onConflictDoUpdate({
          target: conflictKeys,
          set: Object.fromEntries(upsertFields.map((col) => [col.name, col.value])),
        });
      inserted += batch.length;
      batches++;
    } catch (error) {
      console.error(`[SEED] Batch insert failed:`, error);
      throw error;
    }
  }

  return { inserted, batches };
}

/**
 * Validate items against a zod schema, returning valid items and errors
 */
export function validateItems<T>(
  items: unknown[],
  schema: z.ZodType<T>
): { valid: T[]; errors: Array<{ index: number; error: z.ZodError }> } {
  const valid: T[] = [];
  const errors: Array<{ index: number; error: z.ZodError }> = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({ index, error: result.error });
    }
  });

  return { valid, errors };
}
