import { type Table } from "drizzle-orm";

import { db } from "@/database/db";
import { type DbMutationResult, type PaginatedResponse, type QueryOptions } from "@/types";

/**
 * Generic Base DAL for type-safe database operations
 * @template T - Table type
 */
export abstract class BaseDAL<T extends Table> {
  protected table: T;

  constructor(table: T) {
    this.table = table;
  }

  /**
   * Get all records with optional filtering
   */
  async getAll(options?: QueryOptions) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;

      // @ts-expect-error - Drizzle type constraint issue, will be resolved in type-safe refactor
      const data = await db.select().from(this.table).limit(limit).offset(offset);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Query failed" };
    }
  }

  /**
   * Get paginated results
   */
  async paginate(options: QueryOptions): Promise<PaginatedResponse<unknown>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;

      // @ts-expect-error - Drizzle type constraint issue, will be resolved in type-safe refactor
      const data = await db.select().from(this.table).limit(limit).offset(offset);

      return {
        data,
        meta: {
          page,
          limit,
          total: data.length,
          totalPages: Math.ceil(data.length / limit),
          hasNextPage: data.length === limit,
          hasPrevPage: page > 1,
        },
      };
    } catch {
      return {
        data: [],
        meta: {
          page: options.page || 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  }

  /**
   * Create record - override in child classes
   */
  abstract create(data: unknown): Promise<DbMutationResult<unknown>>;

  /**
   * Update record - override in child classes
   */
  abstract update(id: unknown, data: unknown): Promise<DbMutationResult<unknown>>;

  /**
   * Delete record - override in child classes
   */
  abstract delete(id: unknown): Promise<DbMutationResult<null>>;
}
