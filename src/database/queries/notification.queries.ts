import { desc, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { notification } from "@/database/schema";
import { type Notification } from "@/types";

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt));

  return rows.map((r) => ({
    ...r,
    id: String((r as { id: bigint | number | string }).id),
  })) as Notification[];
}
