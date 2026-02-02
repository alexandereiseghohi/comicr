import * as mutations from "@/database/mutations/bookmark-mutations";
import { bookmark } from "@/database/schema";
import { type AddBookmarkInput } from "@/schemas/bookmark-schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

/**
 * Data Access Layer for Bookmark entities
 * Provides type-safe database operations for user comic bookmarks
 * @extends BaseDAL
 */
export class BookmarkDAL extends BaseDAL<typeof bookmark> {
  constructor() {
    super(bookmark);
  }

  /**
   * Create a new bookmark for a user and comic
   * @param data - Object containing userId and comicId
   * @param data.userId - The user's ID (UUID string)
   * @param data.comicId - The comic's ID to bookmark
   * @returns Promise resolving to created bookmark or error
   * @throws {Error} If bookmark already exists or comic/user not found
   * @example
   * ```ts
   * const result = await bookmarkDAL.create({
   *   userId: "abc-123",
   *   comicId: 456
   * });
   * ```
   */
  async create(data: AddBookmarkInput): Promise<DbMutationResult<typeof bookmark.$inferSelect>> {
    try {
      return await mutations.createBookmark(data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  /**
   * Update a bookmark (not supported - bookmarks are immutable)
   * @param _id - Bookmark ID (not used)
   * @param _data - Update data (not used)
   * @returns Error result - bookmarks cannot be updated
   * @deprecated Bookmarks are immutable - delete and recreate if needed
   */
  async update(
    _id: number,
    _data: Partial<typeof bookmark.$inferInsert>
  ): Promise<DbMutationResult<typeof bookmark.$inferSelect>> {
    return { success: false, error: "Bookmarks are immutable" };
  }

  /**
   * Delete a bookmark by userId and comicId
   * @param data - Object containing userId and comicId
   * @param data.userId - The user's ID who owns the bookmark
   * @param data.comicId - The comic's ID to unbookmark
   * @returns Promise resolving to success status or error
   * @example
   * ```ts
   * const result = await bookmarkDAL.delete({
   *   userId: "abc-123",
   *   comicId: 456
   * });
   * ```
   */
  async delete(data: { comicId: number; userId: string }): Promise<DbMutationResult<null>> {
    try {
      return await mutations.deleteBookmark(data.userId, data.comicId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const bookmarkDAL = new BookmarkDAL();
