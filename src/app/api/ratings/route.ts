import { auth } from "@/auth";
import {
  createOrUpdateRating,
  deleteRating,
  getUserRating,
} from "@/database/mutations/rating-mutations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, value } = await request.json();
    const rating = await createOrUpdateRating(session.user.id, comicId, value);

    return NextResponse.json(rating, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId } = await request.json();
    await deleteRating(session.user.id, comicId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 });
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

    const rating = await getUserRating(session.user.id, comicId);

    return NextResponse.json({ rating });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 });
  }
}
