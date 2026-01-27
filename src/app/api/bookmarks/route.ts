import { auth } from "@/auth";
import {
  createBookmark,
  deleteBookmark,
  isBookmarked,
} from "@/database/mutations/bookmark-mutations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId } = await request.json();
    const bookmark = await createBookmark(session.user.id, comicId);

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Failed to create bookmark" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
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

    const bookmarked = await isBookmarked(session.user.id, comicId);

    return NextResponse.json({ bookmarked });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json({ error: "Failed to check bookmark" }, { status: 500 });
  }
}
