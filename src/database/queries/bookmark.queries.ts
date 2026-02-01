import { db } from "@/database/db";
import { bookmark, chapter, comic } from "@/database/schema";
import { and, desc, eq } from "drizzle-orm";

/**
 * Get bookmarks by user ID (simple)
 */
export async function getBookmarksByUser(userId: string) {
  try {
    const results = await db.select().from(bookmark).where(eq(bookmark.userId, userId)).limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get bookmarks with full comic details for display
 */
export async function getBookmarksWithComics(userId: string) {
  try {
    const results = await db
      .select({
        bookmark: {
          userId: bookmark.userId,
          comicId: bookmark.comicId,
          lastReadChapterId: bookmark.lastReadChapterId,
          createdAt: bookmark.createdAt,
        },
        comic: {
          id: comic.id,
          title: comic.title,
          slug: comic.slug,
          coverImage: comic.coverImage,
          status: comic.status,
          rating: comic.rating,
          views: comic.views,
          description: comic.description,
        },
        lastReadChapter: {
          id: chapter.id,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
        },
      })
      .from(bookmark)
      .innerJoin(comic, eq(bookmark.comicId, comic.id))
      .leftJoin(chapter, eq(bookmark.lastReadChapterId, chapter.id))
      .where(eq(bookmark.userId, userId))
      .orderBy(desc(bookmark.createdAt))
      .limit(100);

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Check if a comic is bookmarked by user
 */
export async function isComicBookmarked(userId: string, comicId: number) {
  try {
    const result = await db
      .select({ comicId: bookmark.comicId })
      .from(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
      .limit(1);

    return { success: true, data: result.length > 0 };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
