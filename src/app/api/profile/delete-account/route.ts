import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth-config";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Soft delete: Set deletedAt timestamp and anonymize PII
    await db
      .update(user)
      .set({
        deletedAt: new Date(),
        email: `deleted_${userId}@example.com`,
        name: "Deleted User",
        image: null,
      })
      .where(eq(user.id, userId));

    // Note: Comments and other user content remain but are now associated with "Deleted User"
    // This preserves discussion threads while removing personal identification

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
