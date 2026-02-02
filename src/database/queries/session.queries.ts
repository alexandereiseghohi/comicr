import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { session } from "@/database/schema";

export async function getSessionByToken(sessionToken: string) {
  try {
    const result = await db.select().from(session).where(eq(session.sessionToken, sessionToken)).limit(1);
    return { success: true, data: result[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getSessionsByUser(userId: string) {
  try {
    const result = await db.select().from(session).where(eq(session.userId, userId));
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
