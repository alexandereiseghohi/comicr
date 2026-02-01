import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comic-mutations";
import { comic } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class ComicDAL extends BaseDAL<typeof comic> {
  constructor() {
    super(comic);
  }

  async getById(id: number) {
    try {
      const result = await db.query.comic.findFirst({
        where: eq(comic.id, id),
        with: { author: true, artist: true, genres: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof comic.$inferInsert
  ): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.createComic(data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof comic.$inferInsert>
  ): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.updateComic(id, data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteComic(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const comicDAL = new ComicDAL();
