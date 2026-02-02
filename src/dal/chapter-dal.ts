import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/chapter-mutations";
import { chapter } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

export class ChapterDAL extends BaseDAL<typeof chapter> {
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
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof chapter.$inferInsert
  ): Promise<DbMutationResult<typeof chapter.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.createChapter(data as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof chapter.$inferInsert>
  ): Promise<DbMutationResult<typeof chapter.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.updateChapter(id, data as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result as any;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteChapter(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const chapterDAL = new ChapterDAL();
