import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";

import { db } from "@/database/db";
import { artist, author, chapter, comic, comicToGenre, genre, type, user } from "@/database/schema";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const [comicsCount, chaptersCount, usersCount, totalViews] = await Promise.all([
      db.select({ count: count() }).from(comic),
      db.select({ count: count() }).from(chapter),
      db.select({ count: count() }).from(user),
      db.select({ total: sum(comic.views) }).from(comic),
    ]);

    return {
      success: true,
      data: {
        comics: comicsCount[0]?.count ?? 0,
        chapters: chaptersCount[0]?.count ?? 0,
        users: usersCount[0]?.count ?? 0,
        views: Number(totalViews[0]?.total ?? 0),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get recent comics for dashboard
 */
export async function getRecentComics(limit = 5) {
  try {
    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        status: comic.status,
        views: comic.views,
        createdAt: comic.createdAt,
      })
      .from(comic)
      .orderBy(desc(comic.createdAt))
      .limit(limit);

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get recent users for dashboard
 */
export async function getRecentUsers(limit = 5) {
  try {
    const results = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(limit);

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get popular comics (by views)
 */
export async function getPopularComics(limit = 10) {
  try {
    const results = await db
      .select({
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        coverImage: comic.coverImage,
        status: comic.status,
        views: comic.views,
        rating: comic.rating,
      })
      .from(comic)
      .orderBy(desc(comic.views))
      .limit(limit);

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get comics with pagination for admin table
 */
export async function getComicsForAdmin({
  page = 1,
  limit = 20,
  search: _search,
  status: _status,
}: {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;

    // Build query
    const query = db
      .select({
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        coverImage: comic.coverImage,
        status: comic.status,
        views: comic.views,
        rating: comic.rating,
        createdAt: comic.createdAt,
      })
      .from(comic)
      .orderBy(desc(comic.createdAt))
      .limit(limit)
      .offset(offset);

    const results = await query;
    const totalResult = await db.select({ count: count() }).from(comic);
    const total = totalResult[0]?.count ?? 0;

    return {
      success: true,
      data: {
        comics: results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get users with pagination for admin table
 */
export async function getUsersForAdmin({
  page = 1,
  limit = 20,
  role: _role,
}: {
  limit?: number;
  page?: number;
  role?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: count() }).from(user);
    const total = totalResult[0]?.count ?? 0;

    return {
      success: true,
      data: {
        users: results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get chapters with pagination for admin table
 */
export async function getChaptersForAdmin({
  page = 1,
  limit = 20,
  comicId,
}: {
  comicId?: number;
  limit?: number;
  page?: number;
} = {}) {
  try {
    const offset = (page - 1) * limit;

    const baseQuery = comicId
      ? db
          .select({
            id: chapter.id,
            number: chapter.chapterNumber,
            title: chapter.title,
            comicId: chapter.comicId,
            comicTitle: comic.title,
            createdAt: chapter.createdAt,
          })
          .from(chapter)
          .innerJoin(comic, eq(chapter.comicId, comic.id))
          .where(eq(chapter.comicId, comicId))
          .orderBy(desc(chapter.createdAt))
          .limit(limit)
          .offset(offset)
      : db
          .select({
            id: chapter.id,
            number: chapter.chapterNumber,
            title: chapter.title,
            comicId: chapter.comicId,
            comicTitle: comic.title,
            createdAt: chapter.createdAt,
          })
          .from(chapter)
          .innerJoin(comic, eq(chapter.comicId, comic.id))
          .orderBy(desc(chapter.createdAt))
          .limit(limit)
          .offset(offset);

    const results = await baseQuery;
    const totalResult = await db.select({ count: count() }).from(chapter);
    const total = totalResult[0]?.count ?? 0;

    return {
      success: true,
      data: {
        chapters: results,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get authors with pagination for admin table
 */
export async function getAuthorsForAdmin({
  page = 1,
  limit = 20,
  search = "",
}: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = search ? ilike(author.name, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: author.id,
          name: author.name,
          bio: author.bio,
          image: author.image,
          isActive: author.isActive,
          createdAt: author.createdAt,
          comicsCount: sql<number>`(
            SELECT COUNT(*) FROM comic
            WHERE comic.author_id = ${author.id}
          )`.as("comics_count"),
        })
        .from(author)
        .where(whereClause)
        .orderBy(desc(author.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(author)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: {
        items,
        total: Number(countResult[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get artists with pagination for admin table
 */
export async function getArtistsForAdmin({
  page = 1,
  limit = 20,
  search = "",
}: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = search ? ilike(artist.name, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: artist.id,
          name: artist.name,
          bio: artist.bio,
          image: artist.image,
          isActive: artist.isActive,
          createdAt: artist.createdAt,
          comicsCount: sql<number>`(
            SELECT COUNT(*) FROM comic
            WHERE comic.artist_id = ${artist.id}
          )`.as("comics_count"),
        })
        .from(artist)
        .where(whereClause)
        .orderBy(desc(artist.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(artist)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: {
        items,
        total: Number(countResult[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get genres with pagination for admin table
 */
export async function getGenresForAdmin({
  page = 1,
  limit = 20,
  search = "",
}: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = search ? or(ilike(genre.name, `%${search}%`), ilike(genre.slug, `%${search}%`)) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: genre.id,
          name: genre.name,
          slug: genre.slug,
          description: genre.description,
          isActive: genre.isActive,
          createdAt: genre.createdAt,
          comicsCount: sql<number>`(
            SELECT COUNT(*) FROM ${comicToGenre}
            WHERE ${comicToGenre.genreId} = ${genre.id}
          )`.as("comics_count"),
        })
        .from(genre)
        .where(whereClause)
        .orderBy(desc(genre.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(genre)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: {
        items,
        total: Number(countResult[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

/**
 * Get types with pagination for admin table
 */
export async function getTypesForAdmin({
  page = 1,
  limit = 20,
  search = "",
}: {
  limit?: number;
  page?: number;
  search?: string;
} = {}) {
  try {
    const offset = (page - 1) * limit;
    const whereClause = search ? ilike(type.name, `%${search}%`) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: type.id,
          name: type.name,
          description: type.description,
          isActive: type.isActive,
          createdAt: type.createdAt,
          comicsCount: sql<number>`(
            SELECT COUNT(*) FROM comic
            WHERE comic.type_id = ${type.id}
          )`.as("comics_count"),
        })
        .from(type)
        .where(whereClause)
        .orderBy(desc(type.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(type)
        .where(whereClause),
    ]);

    return {
      success: true,
      data: {
        items,
        total: Number(countResult[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}
