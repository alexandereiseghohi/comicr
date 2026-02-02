import { type NextRequest, NextResponse } from "next/server";

import * as chapterMutations from "@/database/mutations/chapter.mutations";
import * as chapterQueries from "@/database/queries/chapter.queries";
import { auth } from "@/lib/auth-config";
import { createChapterSchema } from "@/schemas/chapter-schema";
import { type AuthUser } from "@/types/auth";

/**
 * GET /api/chapters
 * Returns paginated list of chapters. Supports filtering by comicId.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const comicId = searchParams.get("comicId");
    // sort and order currently unused; kept for future extension

    if (comicId) {
      const offset = (page - 1) * limit;
      const result = await chapterQueries.getChaptersByComicId(parseInt(comicId), {
        limit,
        offset,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, data: result.data, pagination: { page, limit } });
    }

    return NextResponse.json({ success: false, error: "comicId required" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/chapters
 * Create a new chapter (admin only)
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
      return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });
    }

    const result = await chapterMutations.createChapter(validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
