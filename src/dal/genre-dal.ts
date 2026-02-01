import { db } from "@/database/db";
import * as mutations from "@/database/mutations/genre.mutations";
import { genre } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
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
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createGenre(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(id: number, data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.updateGenre(id, data);
      return result;
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
