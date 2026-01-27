import { db } from "@/database/db";
import { changeUserEmail } from "@/database/mutations/user.mutations";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth-config";
import { verifyPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const EmailSchema = z.object({ email: z.string().email(), currentPassword: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const me = session?.user;
    if (!me || !me.id)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = EmailSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });

    const { email, currentPassword } = parsed.data;

    const rows = await db.select().from(user).where(eq(user.id, me.id));
    const dbUser = rows[0];
    if (!dbUser)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    if (dbUser.password) {
      const ok = verifyPassword(currentPassword, dbUser.password);
      if (!ok)
        return NextResponse.json(
          { success: false, error: "Current password incorrect" },
          { status: 403 }
        );
    }

    const result = await changeUserEmail(me.id, email);
    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
     
    console.error("Change email error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
