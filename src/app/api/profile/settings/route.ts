import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth-config";
import { settingsSchema } from "@/schemas/settings.schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Parse settings from JSONB field or use defaults
    const settings = dbUser.settings
      ? (dbUser.settings as {
          emailNotifications?: boolean;
          profileVisibility?: "private" | "public";
          readingHistoryVisibility?: boolean;
        })
      : {};

    const userSettings = {
      emailNotifications: settings.emailNotifications ?? true,
      profileVisibility: settings.profileVisibility ?? "public",
      readingHistoryVisibility: settings.readingHistoryVisibility ?? true,
    };

    return NextResponse.json({ success: true, data: userSettings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Update settings in JSONB field
    await db.update(user).set({ settings: validation.data }).where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: validation.data,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
