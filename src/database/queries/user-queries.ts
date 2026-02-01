import { db } from "@/database/db";
import { user } from "@/database/schema";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

type User = InferSelectModel<typeof user>;

export async function getUserById(id: string) {
  try {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getAllUsers() {
  try {
    const result = await db.select().from(user);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getUserByEmail(
  email: string
): Promise<{ success: true; data: User | null } | { success: false; error: string }> {
  try {
    const result = await db.select().from(user).where(eq(user.email, email)).limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
