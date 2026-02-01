import { db } from "@/database/db";
import * as mutations from "@/database/mutations/rating-mutations";
import { rating } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class RatingDAL extends BaseDAL<typeof rating> {
  constructor() {
    super(rating);
  }

  async getById(id: number) {
    try {
      const result = await db.query.rating.findFirst({
        where: eq(rating.id, id),
        with: { user: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(data: any): Promise<DbMutationResult<any>> {
    try {
      const result = await mutations.createOrUpdateRating(data.userId, data.comicId, data.value);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(id: number, data: any): Promise<DbMutationResult<any>> {
    return { success: false, error: "Use create with userId/comicId" };
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    return { success: false, error: "Use mutations directly with userId/comicId" };
  }
}

export const ratingDAL = new RatingDAL();
