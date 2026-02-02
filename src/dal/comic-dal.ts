import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/comic-mutations";
import { comic } from "@/database/schema";
import { type CreateComicInput, type UpdateComicInput } from "@/schemas/comic-schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

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
   */
  async getById(id: number) {
    try {
      const result = await db.query.comic.findFirst({
        where: eq(comic.id, id),
        with: { author: true, artist: true, genres: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  /**
   * Create a new comic in the database
   * @param data - Comic data to insert (title, slug, description, etc.)
   * @returns Promise resolving to created comic or error
   * @throws {Error} If required fields are missing or slug already exists
   */
  async create(data: CreateComicInput): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      // Ensure data is of type CreateComicInput
      const input: CreateComicInput = {
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        slug: data.slug,
        status: data.status,
        publicationDate: data.publicationDate,
        authorId: data.authorId,
        typeId: data.typeId,
        ...(data.artistId !== undefined ? { artistId: data.artistId } : {}),
      };
      const result = (await mutations.createComic(input)) as
        | { data: typeof comic.$inferSelect; success: true }
        | { error: string; success: false };
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else if (!result.success) {
        return { success: false, error: result.error || "Create failed" };
      } else {
        return { success: false, error: "Create failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  /**
   * Update an existing comic by ID
   * @param id - The comic ID to update
   * @param data - Partial comic data to update
   * @returns Promise resolving to updated comic or error
   * @throws {Error} If comic not found or update validation fails
   */
  async update(id: number, data: UpdateComicInput): Promise<DbMutationResult<typeof comic.$inferSelect>> {
    try {
      const result = (await mutations.updateComic(id, data as UpdateComicInput)) as
        | { data: typeof comic.$inferSelect; success: true }
        | { error: string; success: false };
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      } else if (!result.success) {
        return { success: false, error: result.error || "Update failed" };
      } else {
        return { success: false, error: "Update failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  /**
   * Delete a comic by ID
   * @param id - The comic ID to delete
   * @returns Promise resolving to success status or error
   * @throws {Error} If comic not found or has dependent chapters
   */
  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      const result = await mutations.deleteComic(id);
      if (result.success) {
        return { success: true, data: null };
      } else {
        return { success: false, error: result.error || "Delete failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  // bulkDelete is not implemented because no bulkDeleteComics mutation exists
}

export const comicDAL = new ComicDAL();
