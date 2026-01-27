import { auth } from "@/auth";
import {
  createOrUpdateReadingProgress,
  deleteReadingProgress,
  getReadingProgress,
} from "@/database/mutations/reading-progress-mutations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, lastChapterId, progress } = await request.json();
    const readingProgress = await createOrUpdateReadingProgress(
      session.user.id,
      comicId,
      lastChapterId,
      progress
    );

    return NextResponse.json(readingProgress, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save reading progress" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId } = await request.json();
    await deleteReadingProgress(session.user.id, comicId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete reading progress" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const comicId = parseInt(searchParams.get("comicId") || "0");

    const progress = await getReadingProgress(session.user.id, comicId);

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reading progress" }, { status: 500 });
  }
}
