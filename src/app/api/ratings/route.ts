import { auth } from "@/auth";
import { deleteRating, upsertRating } from "@/database/mutations/rating-mutations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, value, review } = await request.json();
    const rating = await upsertRating({
      userId: session.user.id,
      comicId,
      rating: value,
      review,
    });

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

    return NextResponse.json({ error: "Use query endpoint instead" }, { status: 410 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 });
  }
}
