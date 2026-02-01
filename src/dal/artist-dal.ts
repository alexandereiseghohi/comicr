import { db } from "@/database/db";
import * as mutations from "@/database/mutations/artist.mutations";
import { artist } from "@/database/schema";
import type { DbMutationResult } from "@/types";
import { eq } from "drizzle-orm";
import { BaseDAL } from "./base-dal";

export class ArtistDAL extends BaseDAL<typeof artist> {
  constructor() {
    super(artist);
  }

  async getById(id: number) {
    try {
      const result = await db.query.artist.findFirst({
        where: eq(artist.id, id),
        with: { comics: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch" };
    }
  }

  async create(
    data: typeof artist.$inferInsert
  ): Promise<DbMutationResult<typeof artist.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.createArtist(data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Create failed" };
    }
  }

  async update(
    id: number,
    data: Partial<typeof artist.$inferInsert>
  ): Promise<DbMutationResult<typeof artist.$inferSelect>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutations.updateArtist(id, data as any);
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Update failed" };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteArtist(id);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Delete failed" };
    }
  }
}

export const artistDAL = new ArtistDAL();
