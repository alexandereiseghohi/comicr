import { db } from "@/database/db";
import * as mutations from "@/database/mutations/user.mutations";
import { user } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class UserDAL extends BaseDAL<typeof user> {
  constructor() {
    super(user);
  }

  async getById(id: string) {
    try {
      const result = await db.query.user.findFirst({ where: eq(user.id, id) });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(_data: any): Promise<DbMutationResult<any>> {
    return { success: false, error: "Use createUser action instead" };
  }

  async update(id: string, data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.updateUserById(id, data);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(_id: string): Promise<DbMutationResult<null>> {
    return { success: false, error: "Use deleteUser action instead" };
  }
}

export const userDAL = new UserDAL();
