import { db } from "@/database/db";
import { bookmark } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function addBookmark(data: {
  userId: string;
  comicId: number;
  lastReadChapterId?: number;
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
      .where(eq(bookmark.userId, userId))
      .where(eq(bookmark.comicId, comicId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
