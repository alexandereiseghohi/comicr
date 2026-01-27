import { db } from "@/database/db";
import { comment } from "@/database/schema";
import type { Comment } from "@/types";
import { eq } from "drizzle-orm";

export async function createComment(
  userId: string,
  chapterId: number,
  content: string
): Promise<Comment> {
  const result = await db.insert(comment).values({ userId, chapterId, content }).returning();
  return result[0] as unknown as Comment;
}

export async function updateComment(commentId: number, content: string): Promise<Comment> {
  const result = await db
    .update(comment)
    .set({ content })
    .where(eq(comment.id, commentId))
    .returning();
  return result[0] as unknown as Comment;
}

export async function deleteComment(commentId: number): Promise<void> {
  await db.delete(comment).where(eq(comment.id, commentId));
}
