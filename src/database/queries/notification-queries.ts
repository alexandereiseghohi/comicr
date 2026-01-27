import { db } from "@/database/db";
import { notification } from "@/database/schema";
import type { Notification } from "@/types";
import { desc, eq } from "drizzle-orm";

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt));

  return rows.map((r) => ({
    ...r,
    id: String((r as { id: string | number | bigint }).id),
  })) as Notification[];
}
