import { type NextRequest, NextResponse } from "next/server";

import * as artistMutations from "@/database/mutations/artist.mutations";
import * as artistQueries from "@/database/queries/artist.queries";
import { auth } from "@/lib/auth-config";
import { createArtistSchema } from "@/schemas/artist-schema";

export async function GET() {
  const res = await artistQueries.getArtists();
  if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 });
  return NextResponse.json({ success: true, data: res.data });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || (user as { role?: "admin" | "moderator" | "user" }).role !== "admin")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = createArtistSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json({ success: false, error: validation.error.issues[0]?.message }, { status: 400 });

    const result = await artistMutations.createArtist(validation.data);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
