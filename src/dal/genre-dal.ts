import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/genre.mutations";
import { genre } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

export class GenreDAL extends BaseDAL<typeof genre> {
  constructor() {
    super(genre);
  }

  async getById(id: number) {
    try {
      const result = await db.query.genre.findFirst({
        where: eq(genre.id, id),
        with: { comics: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof genre.$inferInsert
  ): Promise<DbMutationResult<typeof genre.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.createGenre(data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof genre.$inferInsert>
  ): Promise<DbMutationResult<typeof genre.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.updateGenre(id, data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteGenre(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const genreDAL = new GenreDAL();
