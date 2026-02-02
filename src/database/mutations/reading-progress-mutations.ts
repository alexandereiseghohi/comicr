import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { readingProgress } from "@/database/schema";

type ReadingProgress = {
  chapterId: number;
  comicId: number;
  completedAt?: Date | null;
  createdAt?: Date;
  id?: number;
  lastReadAt: Date;
  pageNumber?: number;
  progress?: number;
  progressPercent?: number;
  scrollPosition?: number;
  totalPages?: number;
  updatedAt?: Date;
  userId: string;
};

interface UpsertProgressData {
  chapterId: number;
  comicId: number;
  currentImageIndex?: number;
  progressPercent?: number;
  scrollPercentage?: number;
  userId: string;
}

/**
 * Create or update reading progress with full details
 */
export async function upsertReadingProgress(data: UpsertProgressData) {
  try {
    const result = await db
      .insert(readingProgress)
      .values({
        userId: data.userId,
        comicId: data.comicId,
        chapterId: data.chapterId,
        currentImageIndex: data.currentImageIndex || 0,
        scrollPercentage: data.scrollPercentage || 0,
        progressPercent: data.progressPercent || 0,
        lastReadAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.comicId],
        set: {
          chapterId: data.chapterId,
          currentImageIndex: data.currentImageIndex || 0,
          scrollPercentage: data.scrollPercentage || 0,
          progressPercent: data.progressPercent || 0,
          lastReadAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Upsert reading progress error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save reading progress",
    };
  }
}

export async function createOrUpdateReadingProgress(
  userId: string,
  comicId: number,
  chapterId: number
): Promise<ReadingProgress> {
  // Check if progress exists
  const existing = await db
    .select()
    .from(readingProgress)
    .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(readingProgress)
      .set({ chapterId, lastReadAt: new Date() })
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)));
    const updated = await getReadingProgress(userId, comicId);
    if (!updated) throw new Error("Failed to retrieve updated reading progress");
    return updated;
  } else {
    await db.insert(readingProgress).values({ userId, comicId, chapterId, lastReadAt: new Date() });
    const inserted = await getReadingProgress(userId, comicId);
    if (!inserted) throw new Error("Failed to retrieve inserted reading progress");
    return inserted;
  }
}

export async function deleteReadingProgress(userId: string, comicId: number): Promise<void> {
  await db
    .delete(readingProgress)
    .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)));
}

export async function getReadingProgress(
  userId: string,
  comicId: number
): Promise<null | ReadingProgress> {
  const result = await db
    .select()
    .from(readingProgress)
    .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
