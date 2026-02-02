import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import * as mutations from "@/database/mutations/artist.mutations";
import { artist } from "@/database/schema";
import {
  type CreateArtistInput,
  type UpdateArtistInput,
} from "@/schemas/artist-schema";
import { type DbMutationResult } from "@/types";

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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  async create(
    data: CreateArtistInput,
  ): Promise<DbMutationResult<typeof artist.$inferSelect>> {
    try {
      return await mutations.createArtist(data as CreateArtistInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(
    id: number,
    data: UpdateArtistInput,
  ): Promise<DbMutationResult<typeof artist.$inferSelect>> {
    try {
      return await mutations.updateArtist(id, data as UpdateArtistInput);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteArtist(id);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const artistDAL = new ArtistDAL();
