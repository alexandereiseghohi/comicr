import { updateUserById } from "@/database/mutations/user.mutations";
import { auth } from "@/lib/auth-config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, image } = body;

    const result = await updateUserById(user.id as string, {
      name: name ?? null,
      image: image ?? null,
    });
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
     
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
