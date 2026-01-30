import { db } from "@/database/db";
import { rating } from "@/database/schema";
import { eq } from "drizzle-orm";

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

export async function getRatingsByUser(userId: string) {
  try {
    const result = await db.select().from(rating).where(eq(rating.userId, userId));
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
