import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/user.mutations";
import { user } from "@/database/schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

/**
 * Data Access Layer for User entities
 * Provides type-safe database operations for user accounts
 * @extends BaseDAL
 */
export class UserDAL extends BaseDAL<typeof user> {
  constructor() {
    super(user);
  }

  /**
   * Retrieve a user by their ID
   * @param id - The user ID (UUID string)
   * @returns Promise resolving to user data or error
   * @example
   * ```ts
   * const result = await userDAL.getById("abc-123");
   * if (result.success && result.data) {
   *   console.log(result.data.name);
   * }
   * ```
   */
  async getById(id: string) {
    try {
      const result = await db.query.user.findFirst({ where: eq(user.id, id) });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  /**
   * Create a new user (not directly used - handled by NextAuth)
   * @param _data - User data (not used, NextAuth handles creation)
   * @returns Error result directing to use createUser action
   * @deprecated User creation is managed through NextAuth authentication flow
   */
  async create(_data: typeof user.$inferInsert): Promise<DbMutationResult<typeof user.$inferSelect>> {
    return { success: false, error: "Use createUser action instead" };
  }

  /**
   * Update an existing user by ID
   * @param id - The user ID to update
   * @param data - Partial user data to update (name, image, settings, etc.)
   * @returns Promise resolving to updated user or error
   * @throws {Error} If user not found or update validation fails
   * @example
   * ```ts
   * const result = await userDAL.update("abc-123", {
   *   name: "Updated Name",
   *   settings: { theme: "dark" }
   * });
   * ```
   */
  async update(
    id: string,
    data: Partial<typeof user.$inferInsert>
  ): Promise<DbMutationResult<typeof user.$inferSelect>> {
    try {
      return await mutations.updateUserById(id, data);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  /**
   * Delete a user (soft delete with PII anonymization - not directly used)
   * @param _id - The user ID (not used, use deleteUser action instead)
   * @returns Error result directing to use deleteUser action
   * @deprecated User deletion requires special PII handling through deleteUser action
   */
  async delete(_id: string): Promise<DbMutationResult<null>> {
    return { success: false, error: "Use deleteUser action instead" };
  }
}

export const userDAL = new UserDAL();
