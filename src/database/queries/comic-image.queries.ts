import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { comicImage } from "@/database/schema";

export async function getImagesByComicId(comicId: number) {
  try {
    const results = await db
      .select()
      .from(comicImage)
      .where(eq(comicImage.comicId, comicId))
      .limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getComicImageById(id: number) {
  try {
    const results = await db.select().from(comicImage).where(eq(comicImage.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
