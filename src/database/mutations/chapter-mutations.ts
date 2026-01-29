/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/database/db";
import { chapter as chapterTable } from "@/database/schema";
import type { CreateChapterInput, UpdateChapterInput } from "@/schemas/chapter-schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";

/**
 * Create a single chapter
 */
export async function createChapter(data: CreateChapterInput): Promise<DbMutationResult<any>> {
  try {
    const result = await db.insert(chapterTable).values(data).returning();

    if (!result || result.length === 0) {
      return { success: false, error: "Failed to create chapter" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Update a chapter
 */
export async function updateChapter(
  id: number,
  data: UpdateChapterInput
): Promise<DbMutationResult<any>> {
  try {
    const result = await db
      .update(chapterTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chapterTable.id, id))
      .returning();

    if (!result || result.length === 0) {
      return { success: false, error: "Chapter not found" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a chapter
 */
export async function deleteChapter(id: number): Promise<DbMutationResult<null>> {
  try {
    const result = await db.delete(chapterTable).where(eq(chapterTable.id, id)).returning();

    if (!result || result.length === 0) {
      return { success: false, error: "Chapter not found" };
    }

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Bulk create chapters
 */
export async function bulkCreateChapters(
  data: CreateChapterInput[]
): Promise<DbMutationResult<any[]>> {
  try {
    if (data.length === 0) {
      return { success: false, error: "No chapters provided" };
    }

    if (data.length > 100) {
      return { success: false, error: "Batch size cannot exceed 100" };
    }

    const result = await db.insert(chapterTable).values(data).returning();

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Increment chapter views
 */
export async function incrementChapterViews(id: number) {
  try {
    const chapter = await db.select().from(chapterTable).where(eq(chapterTable.id, id));

    if (chapter.length === 0) {
      return { success: false, error: "Chapter not found" };
    }

    const updatedViews = (chapter[0].views || 0) + 1;

    const result = await db
      .update(chapterTable)
      .set({ views: updatedViews })
      .where(eq(chapterTable.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Delete all chapters for a comic (cleanup)
 */
export async function deleteChaptersByComicId(comicId: number) {
  try {
    const result = await db
      .delete(chapterTable)
      .where(eq(chapterTable.comicId, comicId))
      .returning();

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
