import { eq, sql } from "drizzle-orm";

import { db } from "@/database/db";
import { comic } from "@/database/schema";
import { type CreateComicInput, type UpdateComicInput } from "@/schemas/comic-schema";

/**
 * Create a new comic
 */
export async function createComic(
  data: CreateComicInput
): Promise<{ data: typeof comic.$inferSelect; success: true } | { error: string; success: false }> {
  try {
    const result = await db.insert(comic).values(data).returning();
    return { success: true, data: result[0] as typeof comic.$inferSelect };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

/**
 * Update an existing comic
 */
export async function updateComic(
  id: number,
  data: UpdateComicInput
): Promise<{ data: typeof comic.$inferSelect; success: true } | { error: string; success: false }> {
  try {
    const result = await db
      .update(comic)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(comic.id, id))
      .returning();
    return { success: true, data: result[0] as typeof comic.$inferSelect };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

/**
 * Delete a comic
 */
export async function deleteComic(id: number) {
  try {
    await db.delete(comic).where(eq(comic.id, id)).returning();

    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deletion failed",
    };
  }
}

/**
 * Bulk create comics
 */
export async function bulkCreateComics(data: CreateComicInput[]) {
  try {
    const results = await db.insert(comic).values(data).returning();

    return { success: true, data: results, count: results.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk creation failed",
    };
  }
}

/**
 * Increment comic views
 */
export async function incrementComicViews(id: number) {
  try {
    const result = await db
      .update(comic)
      .set({ views: sql`${comic.views} + 1` })
      .where(eq(comic.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}
