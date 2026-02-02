import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/chapter-mutations";
import { chapter } from "@/database/schema";
import { type CreateChapterInput, type UpdateChapterInput } from "@/schemas/chapter-schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

export class ChapterDAL extends BaseDAL<typeof chapter> {
  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      const result = await mutations.deleteChapter(id);
      if (result.success) {
        return { success: true, data: null };
      } else {
        return { success: false, error: result.error || "Delete failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
  constructor() {
    super(chapter);
  }

  async getById(id: number) {
    try {
      const result = await db.query.chapter.findFirst({
        where: eq(chapter.id, id),
        with: { comic: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  async create(data: CreateChapterInput): Promise<DbMutationResult<typeof chapter.$inferSelect>> {
    try {
      const result = await mutations.createChapter(data);
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else if (!result.success) {
        return { success: false, error: result.error || "Create failed" };
      } else {
        return { success: false, error: "Create failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(id: number, data: UpdateChapterInput): Promise<DbMutationResult<typeof chapter.$inferSelect>> {
    try {
      const result = await mutations.updateChapter(id, data);
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else if (!result.success) {
        return { success: false, error: result.error || "Update failed" };
      } else {
        return { success: false, error: "Update failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }
  // deleteByComicId, bulkDeleteByComicIds, and bulkDelete are not implemented because no corresponding mutations exist
}

export const chapterDAL = new ChapterDAL();
