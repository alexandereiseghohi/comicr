import { db } from "@/database/db";
import { artist } from "@/database/schema";
import { eq, ilike } from "drizzle-orm";

export async function getArtists() {
  try {
    const results = await db.select().from(artist).orderBy(artist.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getArtistById(id: number) {
  try {
    const results = await db.select().from(artist).where(eq(artist.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function searchArtists(term: string) {
  try {
    const results = await db
      .select()
      .from(artist)
      .where(ilike(artist.name, `%${term}%`));
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
