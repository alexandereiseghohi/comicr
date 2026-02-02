import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comment-mutations";
import { comment } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

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
    chapterId: number;
    content: string;
    parentId?: null | number;
    userId: string;
  }): Promise<DbMutationResult<typeof comment.$inferSelect>> {
    try {
      return await mutations.createComment(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    content: string
  ): Promise<DbMutationResult<typeof comment.$inferSelect>> {
    try {
      return await mutations.updateComment(id, content);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: { id: number; userId: string } | number): Promise<DbMutationResult<null>> {
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
