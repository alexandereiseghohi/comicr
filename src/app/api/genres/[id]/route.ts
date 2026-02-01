import * as genreMutations from "@/database/mutations/genre.mutations";
import * as genreQueries from "@/database/queries/genre.queries";
import { auth } from "@/lib/auth-config";
import { updateGenreSchema } from "@/schemas/genre-schema";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const genreId = parseInt(id);
  if (isNaN(genreId))
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  const res = await genreQueries.getGenreById(genreId);
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
    const genreId = parseInt(id);
    if (isNaN(genreId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const validation = updateGenreSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );

    const result = await genreMutations.updateGenre(genreId, validation.data);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: "admin" | "moderator" | "user" }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const genreId = parseInt(id);
    if (isNaN(genreId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const result = await genreMutations.deleteGenre(genreId);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
