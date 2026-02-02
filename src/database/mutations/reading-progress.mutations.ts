import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { readingProgress } from "@/database/schema";

export async function upsertProgress(data: {
  chapterId: number;
  comicId: number;
  pageNumber?: number;
  progressPercent?: number;
  scrollPosition?: number;
  totalPages?: number;
  userId: string;
}) {
  try {
    // Simplified upsert: insert for now
    const result = await db.insert(readingProgress).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Upsert failed" };
  }
}

export async function getProgress(id: number) {
  try {
    const results = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.id, id))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
