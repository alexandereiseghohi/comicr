import { db } from "@/database/db";
import { passwordResetToken } from "@/database/schema";

export async function createPasswordResetToken({
  email,
  token,
  expires,
}: {
  email: string;
  expires: Date;
  token: string;
}) {
  try {
    const result = await db.insert(passwordResetToken).values({ email, token, expires }).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token creation failed",
    };
  }
}
