import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { readingProgress } from "@/database/schema";

export async function getProgressByUser(userId: string) {
  try {
    const results = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
