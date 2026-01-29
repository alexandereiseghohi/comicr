import * as authorMutations from "@/database/mutations/author.mutations";
import * as authorQueries from "@/database/queries/author.queries";
import { auth } from "@/lib/auth-config";
import { updateAuthorSchema } from "@/schemas/author-schema";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authorId = parseInt(id);
  if (isNaN(authorId))
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  const res = await authorQueries.getAuthorById(authorId);
  if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 404 });
  return NextResponse.json({ success: true, data: res.data });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: "admin" | "moderator" | "user" }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const authorId = parseInt(id);
    if (isNaN(authorId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const validation = updateAuthorSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );

    const result = await authorMutations.updateAuthor(authorId, validation.data);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: "admin" | "moderator" | "user" }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const authorId = parseInt(id);
    if (isNaN(authorId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const result = await authorMutations.deleteAuthor(authorId);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
