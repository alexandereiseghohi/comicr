import { db } from "@/database/db";
import { chapter as chapterTable } from "@/database/schema";
import { asc, desc, eq, ilike } from "drizzle-orm";

/**
 * Get all chapters with pagination
 */
export async function getAllChapters({
  page = 1,
  limit = 20,
  sort: _sort = "createdAt",
  order = "desc",
}: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
} = {}) {
  const offset = (page - 1) * limit;
  const orderDirection = order === "asc" ? asc : desc;

  try {
    const chapters = await db
      .select()
      .from(chapterTable)
      .limit(limit)
      .offset(offset)
      .orderBy(orderDirection(chapterTable.createdAt));

    const totalResult = await db.select({ count: chapterTable.id }).from(chapterTable);
    const total = totalResult.length;

    return { success: true, data: chapters, total };
  } catch {
    return { success: false, error: "Failed to fetch chapters" };
  }
}

/**
 * Get chapter by ID
 */
export async function getChapterById(id: number) {
  try {
    const result = await db.select().from(chapterTable).where(eq(chapterTable.id, id));

    if (result.length === 0) {
      return { success: false, error: "Chapter not found", data: null };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: String(error), data: null };
  }
}

/**
 * Get chapter by slug
 */
export async function getChapterBySlug(slug: string) {
  try {
    const result = await db.select().from(chapterTable).where(eq(chapterTable.slug, slug));

    if (result.length === 0) {
      return { success: false, error: "Chapter not found", data: null };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: String(error), data: null };
  }
}

/**
 * Get chapters by comic ID with pagination
 */
export async function getChaptersByComicId(
  comicId: number,
  {
    page = 1,
    limit = 20,
    sort: _sort = "chapterNumber",
    order = "asc",
  }: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  } = {}
) {
  const offset = (page - 1) * limit;
  const orderDirection = order === "asc" ? asc : desc;

  try {
    const chapters = await db
      .select()
      .from(chapterTable)
      .where(eq(chapterTable.comicId, comicId))
      .limit(limit)
      .offset(offset)
      .orderBy(orderDirection(chapterTable.chapterNumber));

    const totalResult = await db
      .select({ count: chapterTable.id })
      .from(chapterTable)
      .where(eq(chapterTable.comicId, comicId));
    const total = totalResult.length;

    return { success: true, data: chapters, total };
  } catch {
    return { success: false, error: "Failed to fetch chapters" };
  }
}

/**
 * Search chapters by title
 */
export async function searchChapters(
  query: string,
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
) {
  const offset = (page - 1) * limit;

  try {
    const chapters = await db
      .select()
      .from(chapterTable)
      .where(ilike(chapterTable.title, `%${query}%`))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(chapterTable.createdAt));

    const totalResult = await db
      .select({ count: chapterTable.id })
      .from(chapterTable)
      .where(ilike(chapterTable.title, `%${query}%`));
    const total = totalResult.length;

    return { success: true, data: chapters, total };
  } catch {
    return { success: false, error: "Failed to search chapters" };
  }
}

/**
 * Get chapters by release date range
 */
export async function getChaptersByDateRange(
  _startDate: Date,
  _endDate: Date,
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
) {
  const offset = (page - 1) * limit;

  try {
    const chapters = await db
      .select()
      .from(chapterTable)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(chapterTable.releaseDate));

    return { success: true, data: chapters, total: chapters.length };
  } catch {
    return { success: false, error: "Failed to fetch chapters by date range" };
  }
}

/**
 * Get latest chapters across all comics
 */
export async function getLatestChapters(limit: number = 20) {
  try {
    const chapters = await db
      .select()
      .from(chapterTable)
      .orderBy(desc(chapterTable.releaseDate))
      .limit(limit);

    return { success: true, data: chapters };
  } catch (error) {
    return { success: false, error: String(error), data: [] };
  }
}
