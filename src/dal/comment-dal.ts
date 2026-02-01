import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comment-mutations";
import { comment } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class CommentDAL extends BaseDAL<typeof comment> {
  constructor() {
    super(comment);
  }

  async getById(id: number) {
    try {
      const result = await db.query.comment.findFirst({
        where: eq(comment.id, id),
        with: { user: true, comic: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(data: {
    content: string;
    userId: string;
    chapterId: number;
    parentId?: number | null;
  }): Promise<DbMutationResult<typeof comment.$inferSelect>> {
    try {
      const result = await mutations.createComment(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    content: string
  ): Promise<DbMutationResult<typeof comment.$inferSelect>> {
    try {
      const result = await mutations.updateComment(id, content);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number | { id: number; userId: string }): Promise<DbMutationResult<null>> {
    try {
      const commentId = typeof id === "number" ? id : id.id;
      const userId = typeof id === "number" ? "" : id.userId;

      if (typeof id !== "number") {
        await mutations.deleteComment(commentId, userId);
      } else {
        // If only id provided, we can't delete (need userId for authorization)
        return { success: false, error: "userId required for comment deletion" };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const commentDAL = new CommentDAL();
