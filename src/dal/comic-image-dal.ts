import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comic-image.mutations";
import { comicImage } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

export class ComicImageDAL extends BaseDAL<typeof comicImage> {
  constructor() {
    super(comicImage);
  }

  async getById(id: number) {
    try {
      const result = await db.query.comicImage.findFirst({
        where: eq(comicImage.id, id),
        with: { comic: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof comicImage.$inferInsert
  ): Promise<DbMutationResult<typeof comicImage.$inferSelect>> {
    try {
      return await mutations.createComicImage(data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  // Comic image updates not supported - use create/delete instead
  async update(
    _id: number,
    _data: Partial<typeof comicImage.$inferInsert>
  ): Promise<DbMutationResult<typeof comicImage.$inferSelect>> {
    return { success: false, error: "Comic images are immutable" };
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteComicImage(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const comicImageDAL = new ComicImageDAL();
