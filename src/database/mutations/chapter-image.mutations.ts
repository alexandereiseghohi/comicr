import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { chapterImage } from "@/database/schema";

export async function createChapterImage(data: { chapterId: number; imageUrl: string; pageNumber: number }) {
  try {
    const result = await db.insert(chapterImage).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function deleteChapterImage(id: number) {
  try {
    await db.delete(chapterImage).where(eq(chapterImage.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
