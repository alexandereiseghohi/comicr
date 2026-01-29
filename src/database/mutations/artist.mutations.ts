import { db } from "@/database/db";
import { artist } from "@/database/schema";
import type { CreateArtistInput, UpdateArtistInput } from "@/schemas/artist-schema";
import { eq } from "drizzle-orm";

export async function createArtist(data: CreateArtistInput) {
  try {
    const result = await db.insert(artist).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function updateArtist(id: number, data: UpdateArtistInput) {
  try {
    const result = await db.update(artist).set(data).where(eq(artist.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function deleteArtist(id: number) {
  try {
    await db.delete(artist).where(eq(artist.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
