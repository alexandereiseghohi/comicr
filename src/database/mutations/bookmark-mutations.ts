import { db } from "@/database/db";
import { bookmark } from "@/database/schema";
import type { Bookmark } from "@/types";
import { and, eq } from "drizzle-orm";

export async function createBookmark(userId: string, comicId: number): Promise<Bookmark> {
  const result = await db.insert(bookmark).values({ userId, comicId }).returning();
  return result[0] as unknown as Bookmark;
}

export async function deleteBookmark(userId: string, comicId: number): Promise<void> {
  await db.delete(bookmark).where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)));
}

export async function isBookmarked(userId: string, comicId: number): Promise<boolean> {
  const result = await db
    .select()
    .from(bookmark)
    .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
    .limit(1);
  return result.length > 0;
}
