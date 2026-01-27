/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/database/db";
import { readingProgress } from "@/database/schema";
import { and, eq } from "drizzle-orm";
type ReadingProgress = {
  userId: string;
  comicId: number;
  chapterId: number;
  // progress may be stored as progressPercent in the DB; keep both optional to match DB rows
  progress?: number;
  progressPercent?: number;
  pageNumber?: number;
  scrollPosition?: number;
  totalPages?: number;
  completedAt?: Date | null;
  lastReadAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  id?: number;
};

export async function createOrUpdateReadingProgress(
  userId: string,
  comicId: number,
  chapterId: number,
  progress: number
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
      .set({ chapterId, progress, lastReadAt: new Date() } as any)
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)));
    const updated = await getReadingProgress(userId, comicId);
    if (!updated) throw new Error("Failed to retrieve updated reading progress");
    return updated;
  } else {
    await db
      .insert(readingProgress)
      .values({ userId, comicId, chapterId, progress, lastReadAt: new Date() } as any);
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
): Promise<ReadingProgress | null> {
  const result = await db
    .select()
    .from(readingProgress)
    .where(and(eq(readingProgress.userId, userId), eq(readingProgress.comicId, comicId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
