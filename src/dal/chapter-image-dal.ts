import { db } from "@/database/db";
import * as mutations from "@/database/mutations/chapterImage.mutations";
import { chapterImage } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

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

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createChapterImage(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(_id: number, _data: any): Promise<DbMutationResult<any>> {
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
