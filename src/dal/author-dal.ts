import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/author.mutations";
import { author } from "@/database/schema";
import { type CreateAuthorInput, type UpdateAuthorInput } from "@/schemas/author-schema";
import { type DbMutationResult } from "@/types";

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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  async create(data: CreateAuthorInput): Promise<DbMutationResult<typeof author.$inferSelect>> {
    try {
      return await mutations.createAuthor(data as CreateAuthorInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(id: number, data: UpdateAuthorInput): Promise<DbMutationResult<typeof author.$inferSelect>> {
    try {
      return await mutations.updateAuthor(id, data as UpdateAuthorInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteAuthor(id);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const authorDAL = new AuthorDAL();
