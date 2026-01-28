import { db } from "@/database/db";
import { comicToGenre } from "@/database/schema";

export async function addGenreToComic(comicId: number, genreId: number) {
  try {
    const result = await db.insert(comicToGenre).values({ comicId, genreId }).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function removeGenreFromComic(comicId: number, genreId: number) {
  try {
    await db.delete(comicToGenre).where({ comicId, genreId } as any);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
