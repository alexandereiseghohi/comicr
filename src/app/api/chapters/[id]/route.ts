import * as chapterMutations from "@/database/mutations/chapter.mutations";
import * as chapterQueries from "@/database/queries/chapter.queries";
import { auth } from "@/lib/auth-config";
import { updateChapterSchema } from "@/lib/schemas/chapter-schema";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const chapterId = parseInt(id);
  if (isNaN(chapterId))
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  const res = await chapterQueries.getChapterById(chapterId);
  if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 404 });
  return NextResponse.json({ success: true, data: res.data });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: string }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const chapterId = parseInt(id);
    if (isNaN(chapterId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const validation = updateChapterSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );

    const result = await chapterMutations.updateChapter(chapterId, validation.data);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: string }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const chapterId = parseInt(id);
    if (isNaN(chapterId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const result = await chapterMutations.deleteChapter(chapterId);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
/**
 * GET /api/chapters/[id] - Get chapter details
 * PATCH /api/chapters/[id] - Update chapter
 * DELETE /api/chapters/[id] - Delete chapter
 */

import type { AuthUser } from "@/types/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/chapters/[id]
 * Get a specific chapter
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid chapter ID" }, { status: 400 });
    }

    const result = await chapterQueries.getChapterById(numId);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || "Chapter not found" },
        { status: 404 }
      );
    }

    // Increment views
    await chapterMutations.incrementChapterViews(numId);

    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/chapters/[id]
 * Update a chapter
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid chapter ID" }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateChapterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await chapterMutations.updateChapter(numId, validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/chapters/[id]
 * Delete a chapter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return NextResponse.json({ success: false, error: "Invalid chapter ID" }, { status: 400 });
    }

    const result = await chapterMutations.deleteChapter(numId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "Chapter deleted successfully",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
