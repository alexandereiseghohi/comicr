import { db } from "@/database/db";
import * as mutations from "@/database/mutations/bookmark-mutations";
import { bookmark } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class BookmarkDAL extends BaseDAL<typeof bookmark> {
  constructor() {
    super(bookmark);
  }

  async getById(id: number) {
    try {
      const result = await db.query.bookmark.findFirst({
        where: eq(bookmark.id, id),
        with: { comic: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createBookmark(data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(id: number, data: any): Promise<DbMutationResult<any>> {
    return { success: false, error: "Bookmarks are immutable" };
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteBookmark(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const bookmarkDAL = new BookmarkDAL();
