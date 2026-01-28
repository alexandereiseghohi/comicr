import { db } from "@/database/db";
import { comment } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getCommentsByChapterId(chapterId: number) {
  try {
    const results = await db
      .select()
      .from(comment)
      .where(eq(comment.chapterId, chapterId))
      .limit(100);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
