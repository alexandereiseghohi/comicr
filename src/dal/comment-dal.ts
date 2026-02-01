import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comment.mutations";
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

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createComment(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(id: number, data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.updateComment(id, data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteComment(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const commentDAL = new CommentDAL();
