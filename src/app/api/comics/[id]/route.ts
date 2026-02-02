/**
 * GET /api/comics/[id] - Get comic details
 * PATCH /api/comics/[id] - Update comic
 * DELETE /api/comics/[id] - Delete comic
 */

import { type NextRequest, NextResponse } from "next/server";

import * as comicMutations from "@/database/mutations/comic-mutations";
import * as comicQueries from "@/database/queries/comic-queries";
import { auth } from "@/lib/auth-config";
import { updateComicSchema } from "@/schemas/comic-schema";

import type { AuthUser } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/comics/[id]
 * Get comic details with relations
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const comicId = parseInt(id);

    if (isNaN(comicId)) {
      return NextResponse.json({ success: false, error: "Invalid comic ID" }, { status: 400 });
    }

    const result = await comicQueries.getComicById(comicId);

    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: "Comic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error" + (error instanceof Error ? error.message : ""),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/comics/[id]
 * Update comic
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth check
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comicId = parseInt(id);

    if (isNaN(comicId)) {
      return NextResponse.json({ success: false, error: "Invalid comic ID" }, { status: 400 });
    }

    // Validate
    const body = await request.json();
    const validation = updateComicSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const result = await comicMutations.updateComic(comicId, validation.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error" + (error instanceof Error ? error.message : ""),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comics/[id]
 * Delete comic
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // Auth check
    const session = await auth();
    const user = session?.user as AuthUser | undefined;
    if (!user?.id || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comicId = parseInt(id);

    if (isNaN(comicId)) {
      return NextResponse.json({ success: false, error: "Invalid comic ID" }, { status: 400 });
    }

    const result = await comicMutations.deleteComic(comicId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
