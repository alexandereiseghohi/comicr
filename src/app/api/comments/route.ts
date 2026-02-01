import { auth } from "@/auth";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/database/mutations/comment-mutations";
import { getComments } from "@/database/queries/comment-queries";
import { commentSchema } from "@/schemas/comment.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - please sign in to comment" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Invalid comment data",
        },
        { status: 400 }
      );
    }

    // Create comment
    const result = await createComment({
      userId: Number(session.user.id),
      chapterId: validation.data.chapterId,
      content: validation.data.content,
      parentId: validation.data.parentId || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Comment posted successfully",
    });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, content } = await request.json();
    const result = await updateComment(commentId, content);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Comment PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await request.json();
    const result = await deleteComment(commentId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = parseInt(searchParams.get("chapterId") || "0");

    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const result = await getComments(chapterId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Comment GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
