import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { chapterImage } from "@/database/schema";

export async function getImagesByChapterId(chapterId: number) {
  try {
    const results = await db
      .select()
      .from(chapterImage)
      .where(eq(chapterImage.chapterId, chapterId))
      .limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getChapterImageById(id: number) {
  try {
    const results = await db.select().from(chapterImage).where(eq(chapterImage.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
