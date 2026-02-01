import { db } from "@/database/db";
import * as mutations from "@/database/mutations/author.mutations";
import { author } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class AuthorDAL extends BaseDAL<typeof author> {
  constructor() {
    super(author);
  }

  async getById(id: number) {
    try {
      const result = await db.query.author.findFirst({
        where: eq(author.id, id),
        with: { comics: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof author.$inferInsert
  ): Promise<DbMutationResult<typeof author.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.createAuthor(data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof author.$inferInsert>
  ): Promise<DbMutationResult<typeof author.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.updateAuthor(id, data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteAuthor(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const authorDAL = new AuthorDAL();
