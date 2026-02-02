import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { comment } from "@/database/schema";

export async function addComment(data: { chapterId: number; content: string; userId: string; }) {
  try {
    const result = await db.insert(comment).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function deleteComment(id: number) {
  try {
    await db.delete(comment).where(eq(comment.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
