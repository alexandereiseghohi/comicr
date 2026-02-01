import { db } from "@/database/db";
import { rating } from "@/database/schema";
import { and, count, eq, sql } from "drizzle-orm";

export async function getRatingById(id: number) {
  try {
    const result = await db.select().from(rating).where(eq(rating.id, id)).limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getRatingsByComic(comicId: number) {
  try {
    const result = await db.select().from(rating).where(eq(rating.comicId, comicId));
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getRatingsByUser(userId: number) {
  try {
    const result = await db.select().from(rating).where(eq(rating.userId, userId));
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get a specific user's rating for a comic
 */
export async function getUserRating(userId: number, comicId: number) {
  try {
    const result = await db
      .select()
      .from(rating)
      .where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error("Get user rating query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user rating",
      data: null,
    };
  }
}

/**
 * Get average rating and total count for a comic
 */
export async function getComicRatingStats(comicId: number) {
  try {
    const result = await db
      .select({
        averageRating: sql<number>`CAST(COALESCE(AVG(${rating.rating}), 0) AS FLOAT)`,
        totalRatings: count(rating.id),
      })
      .from(rating)
      .where(eq(rating.comicId, comicId));

    const stats = result[0];

    return {
      success: true,
      data: {
        averageRating: Number(stats?.averageRating || 0),
        totalRatings: Number(stats?.totalRatings || 0),
      },
    };
  } catch (error) {
    console.error("Get comic rating stats query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch rating statistics",
      data: { averageRating: 0, totalRatings: 0 },
    };
  }
}
