import { db } from "@/database/db";
import { rating } from "@/database/schema";
import { and, eq } from "drizzle-orm";

type Rating = {
  userId: string;
  comicId: number;
  value: number;
};

export async function createOrUpdateRating(
  userId: string,
  comicId: number,
  value: number
): Promise<Rating> {
  // Check if rating exists
  const existing = await db
    .select()
    .from(rating)
    .where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)))
    .limit(1);

  if (existing.length > 0) {
    const result = await db
      .update(rating)
      .set({ rating: String(value) })
      .where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)))
      .returning();
    const row = result[0] as { userId: string; comicId: number; rating: string | number };
    return {
      userId: row.userId,
      comicId: row.comicId,
      value: typeof row.rating === "number" ? row.rating : Number(row.rating),
    };
  } else {
    const result = await db
      .insert(rating)
      .values({ userId, comicId, rating: String(value) })
      .returning();
    const row = result[0] as { userId: string; comicId: number; rating: string | number };
    return {
      userId: row.userId,
      comicId: row.comicId,
      value: typeof row.rating === "number" ? row.rating : Number(row.rating),
    };
  }
}

export async function deleteRating(userId: string, comicId: number): Promise<void> {
  await db.delete(rating).where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)));
}

export async function getUserRating(userId: string, comicId: number): Promise<number | null> {
  const result = await db
    .select()
    .from(rating)
    .where(and(eq(rating.userId, userId), eq(rating.comicId, comicId)))
    .limit(1);
  if (result.length === 0) return null;
  const row = result[0];
  const ratingValue = typeof row.rating === "number" ? row.rating : Number(row.rating);
  return ratingValue !== null && ratingValue !== undefined ? Number(ratingValue) : null;
}
