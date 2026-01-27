import { db } from "@/database/db";
import { user } from "@/database/schema";
import { eq } from "drizzle-orm";

type UpdateUserInput = {
  name?: string | null;
  image?: string | null;
};

export async function updateUserById(id: string, data: UpdateUserInput) {
  try {
    const result = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function changeUserPassword(id: string, hashedPassword: string) {
  try {
    const result = await db
      .update(user)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password update failed",
    };
  }
}

export async function changeUserEmail(id: string, email: string) {
  try {
    const result = await db
      .update(user)
      .set({ email, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email update failed",
    };
  }
}
