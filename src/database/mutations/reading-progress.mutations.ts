import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { readingProgress } from "@/database/schema";

import type { SaveReadingProgressInput } from "@/schemas/reading-progress.schema";

export async function upsertProgress(data: SaveReadingProgressInput & { userId: string }) {
  try {
    // Simplified upsert: insert for now
    const result = await db.insert(readingProgress).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upsert failed",
    };
  }
}

export async function getProgress(id: number) {
  try {
    const results = await db.select().from(readingProgress).where(eq(readingProgress.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

// Aliases for codebase compatibility
export { upsertProgress as upsertReadingProgress };

// New: getReadingProgress(userId, comicId) for compatibility with actions and API
import { and } from "drizzle-orm";

export async function getReadingProgress(userId: string, comicId: number) {
  try {
    const results = await db
      .select()
      .from(readingProgress)
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    return null;
  }
}
