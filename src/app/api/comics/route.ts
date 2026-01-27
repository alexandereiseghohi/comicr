/**
 * GET /api/comics - List all comics
 * POST /api/comics - Create new comic
 */

import * as comicMutations from "@/database/mutations/comic-mutations";
import * as comicQueries from "@/database/queries/comic-queries";
import { auth } from "@/lib/auth-config";
import { createComicSchema } from "@/lib/schemas/comic-schema";
import type { AuthUser } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/comics
 * Returns paginated list of comics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "createdAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const result = await comicQueries.getAllComics({
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
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Internal server error" + error },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comics
 * Create a new comic
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate
    const body = await request.json();
    const validation = createComicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await comicMutations.createComic(validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Internal server error" + error },
      { status: 500 }
    );
  }
}
