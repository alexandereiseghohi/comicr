import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/type.mutations";
import { type } from "@/database/schema";
import {
  type CreateTypeInput,
  type UpdateTypeInput,
} from "@/schemas/type-schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

export class TypeDAL extends BaseDAL<typeof type> {
  constructor() {
    super(type);
  }

  async getById(id: number) {
    try {
      const result = await db.query.type.findFirst({
        where: eq(type.id, id),
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

  async create(
    data: CreateTypeInput,
  ): Promise<DbMutationResult<typeof type.$inferSelect>> {
    try {
      return await mutations.createType(data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(
    id: number,
    data: UpdateTypeInput,
  ): Promise<DbMutationResult<typeof type.$inferSelect>> {
    try {
      return await mutations.updateType(id, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteType(id);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const typeDAL = new TypeDAL();
