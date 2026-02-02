export const runtime = "nodejs";

import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/database/db";
import { changeUserPassword } from "@/database/mutations/user.mutations";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth-config";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const me = session?.user;
    if (!me || !me.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};
    if (!currentPassword || !newPassword)
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });

    const rows = await db.select().from(user).where(eq(user.id, me.id));
    const dbUser = rows[0];
    if (!dbUser || !dbUser.password)
      return NextResponse.json({ success: false, error: "No password set for account" }, { status: 400 });

    const ok = verifyPassword(currentPassword, dbUser.password);
    if (!ok) return NextResponse.json({ success: false, error: "Current password incorrect" }, { status: 403 });

    const hashed = hashPassword(newPassword);
    const result = await changeUserPassword(me.id, hashed);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
