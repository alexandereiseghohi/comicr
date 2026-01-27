import { db } from "@/database/db";
import { genre } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getGenres() {
  try {
    const results = await db.select().from(genre).orderBy(genre.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getGenreById(id: number) {
  try {
    const results = await db.select().from(genre).where(eq(genre.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getGenreBySlug(slug: string) {
  try {
    const results = await db.select().from(genre).where(eq(genre.slug, slug)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
