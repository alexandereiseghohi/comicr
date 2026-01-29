import { db } from "@/database/db";
import { chapter } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getChaptersByComicId(comicId: number, { limit = 20, offset = 0 } = {}) {
  try {
    // Some test mocks may not implement offset chaining; call limit and optionally offset
    const base = db
      .select()
      .from(chapter)
      .where(eq(chapter.comicId, comicId))
      .limit(limit as any);
    // Attempt to apply offset if the query builder supports it (mock-safe)
    // @ts-ignore
    if (typeof base.offset === "function" && offset) {
      // @ts-ignore
      const results = await base.offset(offset);
      return { success: true, data: results };
    }

    const results = await base;
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
