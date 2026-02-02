import { and, eq, ilike } from "drizzle-orm";

import { db } from "@/database/db";
import { artist } from "@/database/schema";

export async function getArtists() {
  try {
    const results = await db
      .select()
      .from(artist)
      .where(eq(artist.isActive, true))
      .orderBy(artist.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getArtistById(id: number) {
  try {
    const results = await db
      .select()
      .from(artist)
      .where(and(eq(artist.id, id), eq(artist.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getArtistByName(name: string) {
  try {
    const results = await db.select().from(artist).where(eq(artist.name, name)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}

export async function searchArtists(term: string) {
  try {
    const results = await db
      .select()
      .from(artist)
      .where(and(ilike(artist.name, `%${term}%`), eq(artist.isActive, true)));
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
