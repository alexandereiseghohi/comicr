import { db } from "@/database/db";
import { chapter } from "@/database/schema";
import type { CreateChapterInput, UpdateChapterInput } from "@/schemas/chapter-schema";
import { eq, sql } from "drizzle-orm";

export async function createChapter(data: CreateChapterInput) {
  try {
    const result = await db.insert(chapter).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function updateChapter(id: number, data: UpdateChapterInput) {
  try {
    const result = await db.update(chapter).set(data).where(eq(chapter.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function deleteChapter(id: number) {
  try {
    await db.delete(chapter).where(eq(chapter.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}

export async function incrementChapterViews(id: number) {
  try {
    const result = await db
      .update(chapter)
      .set({ views: sql`${chapter.views} + 1` })
      .where(eq(chapter.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}
