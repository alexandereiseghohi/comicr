import { type NextRequest, NextResponse } from "next/server";

import { searchComics } from "@/database/queries/comic-queries";
import { QuickSearchSchema } from "@/schemas/search.schema";

/**
 * GET /api/comics/search - Search comics
 * Query params: q (required), limit (optional, default 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = {
      q: searchParams.get("q") || "",
      limit: searchParams.get("limit") || "5",
    };

    const parsed = QuickSearchSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid search parameters" }, { status: 400 });
    }

    const { q, limit } = parsed.data;
    const result = await searchComics(q, { limit });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
