import { db } from "@/database/db";
import { chapter } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getChaptersByComicId(comicId: number, { limit = 20, offset = 0 } = {}) {
  try {
    const results = await db
      .select()
      .from(chapter)
      .where(eq(chapter.comicId, comicId))
      .limit(limit)
      .offset(offset);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getChapterById(id: number) {
  try {
    const results = await db.select().from(chapter).where(eq(chapter.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
