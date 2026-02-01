import * as mutations from "@/database/mutations/bookmark-mutations";
import { bookmark } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { BaseDAL } from "./base-dal";

export class BookmarkDAL extends BaseDAL<typeof bookmark> {
  constructor() {
    super(bookmark);
  }

  async create(data: { userId: string; comicId: number }): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createBookmark(data.userId, data.comicId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(_id: number, _data: any): Promise<DbMutationResult<any>> {
    return { success: false, error: "Bookmarks are immutable" };
  }

  async delete(data: { userId: string; comicId: number }): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteBookmark(data.userId, data.comicId);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const bookmarkDAL = new BookmarkDAL();
