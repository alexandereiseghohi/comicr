import fs from "fs/promises";
import { chunk } from "lodash-es";
import { z } from "zod";
import { db as drizzleDb } from "../database/db";

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
  table: any;
  items: any[];
  batchSize?: number;
  conflictKeys: string[];
  updateFields: string[];
  db?: any;
}) {
  // Use column references directly for upsert updates, as per Drizzle docs
  for (const batch of chunk(items, batchSize)) {
    await db
      .insert(table)
      .values(batch)
      .onConflictDoUpdate({
        target: conflictKeys,
        set: Object.fromEntries(updateFields.map((col) => [col.name, col])),
      });
  }
}
