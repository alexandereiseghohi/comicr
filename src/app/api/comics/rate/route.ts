import { auth } from "@/auth";
import { deleteRating, upsertRating } from "@/database/mutations/rating-mutations";
import { ratingSchema } from "@/schemas/rating.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - please sign in to rate comics" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Handle rating deletion (rating = 0 means remove rating)
    if (body.rating === 0) {
      const result = await deleteRating(session.user.id, body.comicId);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Rating removed successfully",
      });
    }

    // Validate rating input
    const validation = ratingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid rating data",
        },
        { status: 400 }
      );
    }

    // Upsert rating
    const result = await upsertRating({
      userId: session.user.id,
      comicId: validation.data.comicId,
      rating: validation.data.rating,
      review: validation.data.review,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Rating saved successfully",
    });
  } catch (error) {
    console.error("Rating API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
