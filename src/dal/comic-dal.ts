import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comic-mutations";
import { comic } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

/**
 * Data Access Layer for Comic entities
 * Provides type-safe database operations for comics with author, artist, and genre relationships
 * @extends BaseDAL
 */
export class ComicDAL extends BaseDAL<typeof comic> {
  constructor() {
    super(comic);
  }

  /**
   * Retrieve a comic by its ID with related entities
   * @param id - The comic ID to fetch
   * @returns Promise resolving to comic with author, artist, and genres or error
   * @example
   * ```ts
   * const result = await comicDAL.getById(123);
   * if (result.success) {
   *   console.log(result.data.title);
   * }
   * ```
   */
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

  /**
   * Create a new comic in the database
   * @param data - Comic data to insert (title, slug, description, etc.)
   * @returns Promise resolving to created comic or error
   * @throws {Error} If required fields are missing or slug already exists
   * @example
   * ```ts
   * const result = await comicDAL.create({
   *   title: "New Comic",
   *   slug: "new-comic",
   *   description: "A great story"
   * });
   * ```
   */
  async create(
    data: typeof comic.$inferInsert
  ): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.createComic(data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  /**
   * Update an existing comic by ID
   * @param id - The comic ID to update
   * @param data - Partial comic data to update
   * @returns Promise resolving to updated comic or error
   * @throws {Error} If comic not found or update validation fails
   * @example
   * ```ts
   * const result = await comicDAL.update(123, {
   *   status: "Completed",
   *   description: "Updated description"
   * });
   * ```
   */
  async update(
    id: number,
    data: Partial<typeof comic.$inferInsert>
  ): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.updateComic(id, data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  /**
   * Delete a comic by ID
   * @param id - The comic ID to delete
   * @returns Promise resolving to success status or error
   * @throws {Error} If comic not found or has dependent chapters
   * @example
   * ```ts
   * const result = await comicDAL.delete(123);
   * if (result.success) {
   *   console.log("Comic deleted");
   * }
   * ```
   */
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
