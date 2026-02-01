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

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createOrUpdateReadingProgress(
        data.userId,
        data.comicId,
        data.chapterId
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(id: number, data: any): Promise<DbMutationResult<any>> {
    return { success: false, error: "Use create method instead (createOrUpdate)" };
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    return {
      success: false,
      error: "Use mutations.deleteReadingProgress(userId, comicId) directly",
    };
  }
}

export const readingProgressDAL = new ReadingProgressDAL();
