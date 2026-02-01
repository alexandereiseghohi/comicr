import type { Table } from "drizzle-orm";
import fs from "fs/promises";
import { chunk } from "lodash-es";
import { z } from "zod";
import { Database, db as drizzleDb } from "../database/db";

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
 * Batched upsert for Drizzle ORM tables.
 * @param table Drizzle table
 * @param items Array of items to upsert
 * @param batchSize Number of items per batch
 * @param conflictKeys Array of keys to use for upsert conflict
 * @param updateFields Array of fields to update on conflict
 */
export async function seedTableBatched({
  table,
  items,
  batchSize = 100,
  conflictKeys,
  updateFields,
  db = drizzleDb,
}: {
  table: Table;
  items: Record<string, unknown>[];
  batchSize?: number;
  conflictKeys: import("drizzle-orm/pg-core/indexes").IndexColumn[]; // Accept column objects (IndexColumn[])
  updateFields: { name: string; value: unknown }[];
  db?: Database;
}) {
  if (!items || items.length === 0) return; // Skip if no items
  // Always update 'updatedAt' to current timestamp for idempotent upsert
  const upsertFields = [
    ...updateFields.filter((col) => col.value !== undefined),
    { name: "updatedAt", value: new Date() },
  ];
  for (const batch of chunk(items, batchSize)) {
    if (!batch.length) continue;
    await db
      .insert(table as Table)
      .values(batch)
      .onConflictDoUpdate({
        target: conflictKeys,
        set: Object.fromEntries(upsertFields.map((col) => [col.name, col.value])),
      });
  }
}
