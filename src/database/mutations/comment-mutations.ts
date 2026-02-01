import { db } from "@/database/db";
import { comment, user } from "@/database/schema";
import { and, eq, isNull } from "drizzle-orm";

interface CreateCommentData {
  userId: string;
  chapterId: number;
  content: string;
  parentId?: number | null;
}

/**
 * Create a new comment
 */
export async function createComment(data: CreateCommentData) {
  try {
    const result = await db
      .insert(comment)
      .values({
        userId: data.userId,
        chapterId: data.chapterId,
        content: data.content,
        parentId: data.parentId || null,
      })
      .returning();

    if (!result[0]) {
      return { success: false, error: "Failed to create comment" };
    }

    // Get user data to return with comment
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, data.userId))
      .limit(1);

    return {
      success: true,
      data: {
        ...result[0],
        userName: userData[0]?.name || "Unknown User",
        userImage: userData[0]?.image,
      },
    };
  } catch (error) {
    console.error("Create comment mutation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

/**
 * Update comment content
 */
export async function updateComment(commentId: number, content: string) {
  try {
    const result = await db
      .update(comment)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(comment.id, commentId))
      .returning();

    if (!result[0]) {
      return { success: false, error: "Comment not found" };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Update comment mutation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}

/**
 * Soft delete a comment (sets deletedAt timestamp)
 * Preserves comment if it has children, otherwise can be hard deleted
 */
export async function deleteComment(commentId: number, userId: string) {
  try {
    // Check if comment exists and belongs to user
    const existing = await db
      .select()
      .from(comment)
      .where(and(eq(comment.id, commentId), eq(comment.userId, userId), isNull(comment.deletedAt)))
      .limit(1);

    if (!existing[0]) {
      return {
        success: false,
        error: "Comment not found or you don't have permission to delete it",
      };
    }

    // Soft delete - set deletedAt timestamp
    const result = await db
      .update(comment)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(comment.id, commentId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Delete comment mutation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}
