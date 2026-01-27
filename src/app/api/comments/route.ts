import { auth } from "@/auth";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/database/mutations/comment-mutations";
import { getComments } from "@/database/queries/comment-queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, content } = await request.json();
    const comment = await createComment(session.user.id, comicId, content);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, content } = await request.json();
    const comment = await updateComment(commentId, content);

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comments PATCH error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await request.json();
    await deleteComment(commentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comments DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const comicId = parseInt(searchParams.get("comicId") || "0");

    const comments = await getComments(comicId);

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
