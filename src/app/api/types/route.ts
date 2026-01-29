import * as typeMutations from "@/database/mutations/type.mutations";
import * as typeQueries from "@/database/queries/type.queries";
import { auth } from "@/lib/auth-config";
import { createTypeSchema } from "@/schemas/type-schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const res = await typeQueries.getTypes();
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
    const validation = createTypeSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );

    const result = await typeMutations.createType(validation.data);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error("Types POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
