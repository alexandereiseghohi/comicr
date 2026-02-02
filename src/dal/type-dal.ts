import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/type.mutations";
import { type as typeTable } from "@/database/schema";

import { BaseDAL } from "./base-dal";

import type { DbMutationResult } from "@/types";

export class TypeDAL extends BaseDAL<typeof typeTable> {
  constructor() {
    super(typeTable);
  }

  async getById(id: number) {
    try {
      const result = await db.query.type.findFirst({
        where: eq(typeTable.id, id),
        with: { comics: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof typeTable.$inferInsert
  ): Promise<DbMutationResult<typeof typeTable.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.createType(data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof typeTable.$inferInsert>
  ): Promise<DbMutationResult<typeof typeTable.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await mutations.updateType(id, data as any);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteType(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const typeDAL = new TypeDAL();
