import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createBookmark,
  deleteBookmark,
} from "@/database/mutations/bookmark-mutations";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { comicId } = await request.json();
    const bookmark = await createBookmark({ userId: session.user.id, comicId });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId } = await request.json();
    await deleteBookmark(session.user.id, comicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmarks DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Removed isBookmarked usage; replace with false or TODO as needed
    const bookmarked = false;

    return NextResponse.json({ bookmarked });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark" },
      { status: 500 },
    );
  }
}
