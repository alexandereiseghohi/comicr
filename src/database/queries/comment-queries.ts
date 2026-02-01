import { db } from "@/database/db";
import { comment, user } from "@/database/schema";
import { eq } from "drizzle-orm";

interface CommentWithUser {
  id: number;
  content: string;
  userId: number;
  userName: string;
  userImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  parentId: number | null;
  chapterId: number;
}

interface CommentTree extends CommentWithUser {
  children: CommentTree[];
}

/**
 * Build a threaded comment structure from flat list
 */
function buildCommentTree(comments: CommentWithUser[]): CommentTree[] {
  const commentMap = new Map<number, CommentTree>();
  const rootComments: CommentTree[] = [];

  // First pass: create all comment objects with empty children arrays
  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, children: [] });
  });

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const commentNode = commentMap.get(comment.id)!;

    if (comment.parentId === null) {
      // Root level comment
      rootComments.push(commentNode);
    } else {
      // Child comment
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.children.push(commentNode);
      } else {
        // Orphaned comment (parent was deleted) - treat as root
        rootComments.push(commentNode);
      }
    }
  });

  return rootComments;
}

/**
 * Get all comments for a chapter with threaded structure
 */
export async function getComments(chapterId: number) {
  try {
    const comments = await db
      .select({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        userName: user.name,
        userImage: user.image,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        parentId: comment.parentId,
        chapterId: comment.chapterId,
      })
      .from(comment)
      .innerJoin(user, eq(comment.userId, user.id))
      .where(eq(comment.chapterId, chapterId))
      .orderBy(comment.createdAt);

    // Build threaded structure
    const commentTree = buildCommentTree(
      comments.map((c) => ({
        ...c,
        userName: c.userName || "Unknown User",
      }))
    );

    return { success: true, data: commentTree };
  } catch (error) {
    console.error("Get comments query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch comments",
      data: [],
    };
  }
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(commentId: number) {
  try {
    const result = await db
      .select({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        userName: user.name,
        userImage: user.image,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        parentId: comment.parentId,
        chapterId: comment.chapterId,
      })
      .from(comment)
      .innerJoin(user, eq(comment.userId, user.id))
      .where(eq(comment.id, commentId))
      .limit(1);

    if (!result[0]) {
      return { success: false, error: "Comment not found", data: null };
    }

    return {
      success: true,
      data: {
        ...result[0],
        userName: result[0].userName || "Unknown User",
      },
    };
  } catch (error) {
    console.error("Get comment by ID query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch comment",
      data: null,
    };
  }
}
