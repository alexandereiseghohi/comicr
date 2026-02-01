/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Comic Queries
 * @description Read operations for comics
 */

import { db } from "@/database/db";
import { artist, author, comic, comicToGenre, genre } from "@/database/schema";
import { asc, count, desc, eq, ilike, inArray } from "drizzle-orm";

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
    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(comic);
    const totalCount = totalResult?.count || 0;

    // Get paginated comics
    const comics = await db
      .select()
      .from(comic)
      // .orderBy(orderDirection(comic[sort as keyof typeof comic]))
      .limit(limit)
      .offset(offset);

    return { success: true, data: comics, total: totalCount };
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
    const result = await db
      .select({ comic: comic, author: author, artist: artist })
      .from(comic)
      .leftJoin(author, eq(comic.authorId, author.id))
      .leftJoin(artist, eq(comic.artistId, artist.id))
      .where(eq(comic.slug, slug))
      .limit(1);

    // Return a composed object: { comic, author?, artist? } or null
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
    const whereClause = ilike(comic.title, `%${query}%`);

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(comic).where(whereClause);
    const totalCount = totalResult?.count || 0;

    // Get paginated results
    const results = await db
      .select()
      .from(comic)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return { success: true, data: results, total: totalCount };
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
    const whereClause = eq(comic.status, status);

    // Get total count
    const [totalResult] = await db.select({ count: count() }).from(comic).where(whereClause);
    const totalCount = totalResult?.count || 0;

    // Get paginated results
    const results = await db
      .select()
      .from(comic)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return { success: true, data: results, total: totalCount };
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

/**
 * Get comics by genre slugs
 */
export async function getComicsByGenres(
  genreSlugs: string[],
  {
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
  }: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  } = {}
) {
  try {
    if (genreSlugs.length === 0) {
      return getAllComics({ page, limit, sort, order });
    }

    const offset = (page - 1) * limit;
    const orderDirection = order === "asc" ? asc(comic.createdAt) : desc(comic.createdAt);

    // First get genre IDs from slugs
    const genreResults = await db
      .select({ id: genre.id })
      .from(genre)
      .where(inArray(genre.slug, genreSlugs));

    const genreIds = genreResults.map((g) => g.id);

    if (genreIds.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    // Then get all comic IDs that have those genres
    const allComicIds = await db
      .selectDistinct({ comicId: comicToGenre.comicId })
      .from(comicToGenre)
      .where(inArray(comicToGenre.genreId, genreIds));

    if (allComicIds.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    const comicIdList = allComicIds.map((c) => c.comicId);
    const totalCount = allComicIds.length;

    // Get paginated results
    const results = await db
      .select()
      .from(comic)
      .where(inArray(comic.id, comicIdList))
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset);

    return { success: true, data: results, total: totalCount };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
