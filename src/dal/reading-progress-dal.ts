import { db } from "@/database/db";
import * as mutations from "@/database/mutations/reading-progress-mutations";
import { readingProgress } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class ReadingProgressDAL extends BaseDAL<typeof readingProgress> {
  constructor() {
    super(readingProgress);
  }

  async getById(id: number) {
    try {
      const result = await db.query.readingProgress.findFirst({
        where: eq(readingProgress.id, id),
        with: { user: true, comic: true, chapter: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(data: {
    userId: string;
    comicId: number;
    chapterId: number;
    currentImageIndex?: number;
    scrollPercentage?: number;
    progressPercent?: number;
  }): Promise<DbMutationResult<typeof readingProgress.$inferSelect>> {
    try {
      const result = await mutations.upsertReadingProgress(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    _id: number,
    _data: Partial<typeof readingProgress.$inferInsert>
  ): Promise<DbMutationResult<typeof readingProgress.$inferSelect>> {
    return { success: false, error: "Use create method instead (createOrUpdate)" };
  }

  async delete(_id: number): Promise<DbMutationResult<null>> {
    return {
      success: false,
      error: "Use mutations.deleteReadingProgress(userId, comicId) directly",
    };
  }
}

export const readingProgressDAL = new ReadingProgressDAL();
