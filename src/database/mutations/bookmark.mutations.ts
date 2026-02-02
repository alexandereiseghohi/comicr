import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookmark } from "@/database/schema";

export async function addBookmark(data: {
  comicId: number;
  lastReadChapterId?: number;
  userId: string;
}) {
  try {
    const result = await db.insert(bookmark).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function removeBookmark(userId: string, comicId: number) {
  try {
    await db
      .delete(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
