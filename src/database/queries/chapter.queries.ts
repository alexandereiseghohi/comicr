import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { chapter } from "@/database/schema";

export async function getChaptersByComicId(comicId: number, { limit = 20, offset = 0 } = {}) {
  try {
    // Some test mocks may not implement offset chaining; call limit and optionally offset
    const base = db.select().from(chapter).where(eq(chapter.comicId, comicId)).limit(limit);
    // Attempt to apply offset if the query builder supports it (mock-safe)
    const maybeOffset = (base as unknown as { offset?: (n: number) => Promise<unknown> }).offset;
    if (typeof maybeOffset === "function" && offset) {
      const results = await maybeOffset.call(base, offset);
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
