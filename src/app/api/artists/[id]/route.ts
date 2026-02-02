import { type NextRequest, NextResponse } from "next/server";

import * as artistMutations from "@/database/mutations/artist.mutations";
import * as artistQueries from "@/database/queries/artist.queries";
import { auth } from "@/lib/auth-config";
import { updateArtistSchema } from "@/schemas/artist-schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const artistId = parseInt(id);
  if (isNaN(artistId))
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  const res = await artistQueries.getArtistById(artistId);
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
    const artistId = parseInt(id);
    if (isNaN(artistId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const validation = updateArtistSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );

    const result = await artistMutations.updateArtist(artistId, validation.data);
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
    const artistId = parseInt(id);
    if (isNaN(artistId))
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const result = await artistMutations.deleteArtist(artistId);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
