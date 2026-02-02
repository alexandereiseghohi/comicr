import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/genre.mutations";
import { genre } from "@/database/schema";
import { type CreateGenreInput, type UpdateGenreInput } from "@/schemas/genre-schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  async create(data: CreateGenreInput): Promise<DbMutationResult<typeof genre.$inferSelect>> {
    try {
      return await mutations.createGenre(data as CreateGenreInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(id: number, data: UpdateGenreInput): Promise<DbMutationResult<typeof genre.$inferSelect>> {
    try {
      return await mutations.updateGenre(id, data as UpdateGenreInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteGenre(id);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const genreDAL = new GenreDAL();
