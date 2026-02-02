import { and, eq, ilike } from "drizzle-orm";

import { db } from "@/database/db";
import { author } from "@/database/schema";

export async function getAuthors() {
  try {
    const results = await db.select().from(author).where(eq(author.isActive, true)).orderBy(author.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getAuthorById(id: number) {
  try {
    const results = await db
      .select()
      .from(author)
      .where(and(eq(author.id, id), eq(author.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getAuthorByName(name: string) {
  try {
    const results = await db.select().from(author).where(eq(author.name, name)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}

export async function getAuthorBySlug(slug: string) {
  // If no slug column, fallback to name lookup
  try {
    const results = await db
      .select()
      .from(author)
      .where(and(ilike(author.name, `%${slug}%`), eq(author.isActive, true)))
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
      .where(and(ilike(author.name, `%${term}%`), eq(author.isActive, true)));
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
