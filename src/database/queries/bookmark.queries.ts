import { db } from "@/database/db";
import { bookmark } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getBookmarksByUser(userId: string) {
  try {
    const results = await db.select().from(bookmark).where(eq(bookmark.userId, userId)).limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
