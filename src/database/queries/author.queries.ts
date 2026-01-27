import { db } from "@/database/db";
import { author } from "@/database/schema";
import { eq, ilike } from "drizzle-orm";

export async function getAuthors() {
  try {
    const results = await db.select().from(author).orderBy(author.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getAuthorById(id: number) {
  try {
    const results = await db.select().from(author).where(eq(author.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getAuthorBySlug(slug: string) {
  // If no slug column, fallback to name lookup
  try {
    const results = await db
      .select()
      .from(author)
      .where(ilike(author.name, `%${slug}%`))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function searchAuthors(term: string) {
  try {
    const results = await db
      .select()
      .from(author)
      .where(ilike(author.name, `%${term}%`));
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
