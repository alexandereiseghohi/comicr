/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Comic Queries
 * @description Read operations for comics
 */

import { db } from "@/database/db";
import { artist, author, comic } from "@/database/schema";
import { asc, desc, eq, ilike } from "drizzle-orm";

/**
 * Get all comics with pagination
 */
export async function getAllComics({
  page = 1,
  limit = 20,
  sort = "createdAt",
  order = "desc",
}: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
} = {}) {
  const offset = (page - 1) * limit;

  try {
    const comics = await db
      .select()
      .from(comic)
      // .orderBy(orderDirection(comic[sort as keyof typeof comic]))
      .limit(limit)
      .offset(offset);

    return { success: true, data: comics, total: comics.length };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get comic by ID with relations
 */
export async function getComicById(id: number) {
  try {
    const result = await db
      .select({
        comic: comic,
        author: author,
        artist: artist,
      })
      .from(comic)
      .leftJoin(author, eq(comic.authorId, author.id))
      .leftJoin(artist, eq(comic.artistId, artist.id))
      .where(eq(comic.id, id))
      .limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get comic by slug
 */
export async function getComicBySlug(slug: string) {
  try {
    const result = await db.select().from(comic).where(eq(comic.slug, slug)).limit(1);

    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Search comics
 */
export async function searchComics(
  query: string,
  { page = 1, limit = 20, sort = "createdAt", order = "desc" } = {}
) {
  try {
    const offset = (page - 1) * limit;
    const orderDirection = order === "asc" ? asc(comic.createdAt) : desc(comic.createdAt);

    const results = await db
      .select()
      .from(comic)
      .where(ilike(comic.title, `%${query}%`))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get comics by status
 */
export async function getComicsByStatus(
  status: "Ongoing" | "Completed" | "Hiatus" | "Dropped" | "Season End" | "Coming Soon",
  { page = 1, limit = 20, sort = "createdAt", order = "desc" } = {}
) {
  try {
    const offset = (page - 1) * limit;
    const orderDirection = order === "asc" ? asc(comic.createdAt) : desc(comic.createdAt);

    const results = await db
      .select()
      .from(comic)
      .where(eq(comic.status, status))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

/**
 * Get comics by author
 */
export async function getComicsByAuthor(authorId: number) {
  try {
    const results = await db.select().from(comic).where(eq(comic.authorId, authorId));

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
