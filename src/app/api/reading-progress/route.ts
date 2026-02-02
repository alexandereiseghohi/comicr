import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getReadingProgress, upsertReadingProgress } from "@/database/mutations/reading-progress-mutations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, lastChapterId, currentImageIndex, scrollPercentage, progressPercent } = await request.json();
    const readingProgress = await upsertReadingProgress({
      userId: session.user.id,
      comicId,
      chapterId: lastChapterId,
      currentImageIndex,
      scrollPercentage,
      progressPercent,
    });

    return NextResponse.json(readingProgress, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save reading progress" }, { status: 500 });
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
