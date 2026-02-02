import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { comicToGenre } from "@/database/schema";

export async function getGenresByComicId(comicId: number) {
  try {
    const results = await db.select().from(comicToGenre).where(eq(comicToGenre.comicId, comicId)).limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
