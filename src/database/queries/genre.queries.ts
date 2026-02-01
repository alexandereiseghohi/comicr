import { db } from "@/database/db";
import { genre } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export async function getGenres() {
  try {
    const results = await db
      .select()
      .from(genre)
      .where(eq(genre.isActive, true))
      .orderBy(genre.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getGenreById(id: number) {
  try {
    const results = await db
      .select()
      .from(genre)
      .where(and(eq(genre.id, id), eq(genre.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getGenreByName(name: string) {
  try {
    const results = await db.select().from(genre).where(eq(genre.name, name)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}

export async function getGenreBySlug(slug: string) {
  try {
    const results = await db
      .select()
      .from(genre)
      .where(and(eq(genre.slug, slug), eq(genre.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
