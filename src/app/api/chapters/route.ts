/**
 * GET /api/chapters - List all chapters
 * POST /api/chapters - Create new chapter
 */

import * as chapterMutations from "@/database/mutations/chapter-mutations";
import * as chapterQueries from "@/database/queries/chapter-queries";
import { auth } from "@/lib/auth-config";
import { createChapterSchema } from "@/lib/schemas/chapter-schema";
import type { AuthUser } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chapters
 * Returns paginated list of chapters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const comicId = searchParams.get("comicId");
    const sort = searchParams.get("sort") || "chapterNumber";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    if (comicId) {
      const result = await chapterQueries.getChaptersByComicId(parseInt(comicId), {
        page,
        limit,
        sort,
        order,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.total },
      });
    }

    const result = await chapterQueries.getAllChapters({
      page,
      limit,
      sort,
      order,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: { page, limit, total: result.total },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/chapters
 * Create a new chapter
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await chapterMutations.createChapter(validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
