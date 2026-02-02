import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/chapter-image.mutations";
import { chapterImage } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

export class ChapterImageDAL extends BaseDAL<typeof chapterImage> {
  constructor() {
    super(chapterImage);
  }

  async getById(id: number) {
    try {
      const result = await db.query.chapterImage.findFirst({
        where: eq(chapterImage.id, id),
        with: { chapter: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof chapterImage.$inferInsert
  ): Promise<DbMutationResult<typeof chapterImage.$inferSelect>> {
    try {
      return await mutations.createChapterImage(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  // Chapter image updates not supported - use create/delete instead
  async update(
    _id: number,
    _data: Partial<typeof chapterImage.$inferInsert>
  ): Promise<DbMutationResult<typeof chapterImage.$inferSelect>> {
    return { success: false, error: "Chapter images are immutable" };
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteChapterImage(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const chapterImageDAL = new ChapterImageDAL();
