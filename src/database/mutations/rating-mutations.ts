import { db } from "@/database/db";
import { rating } from "@/database/schema";
import { and, eq } from "drizzle-orm";

interface UpsertRatingData {
  userId: string;
  comicId: number;
  rating: number;
  review?: string;
}

/**
 * Create or update a user's rating for a comic
 */
export async function upsertRating(data: UpsertRatingData) {
  try {
    const result = await db
      .insert(rating)
      .values({
        userId: data.userId,
        comicId: data.comicId,
        rating: data.rating,
        review: data.review || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [rating.userId, rating.comicId],
        set: {
          rating: data.rating,
          review: data.review || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Upsert rating mutation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save rating",
    };
  }
}

/**
 * Delete a user's rating for a comic
 */
export async function deleteRating(userId: string, comicId: number) {
  try {
    const result = await db
      .delete(rating)
      .where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Rating not found" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Delete rating mutation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete rating",
    };
  }
}
