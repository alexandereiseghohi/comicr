import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { notification } from "@/database/schema";

import type { Notification } from "@/types";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  comicId?: number,
  chapterId?: number
): Promise<Notification> {
  const result = await db
    .insert(notification)
    .values({ userId, type, title, message, link, comicId, chapterId })
    .returning();
  const row = result[0];
  return {
    ...row,
    id: String(row.id),
  } as Notification;
}

export async function markAsRead(notificationId: number): Promise<Notification> {
  const result = await db
    .update(notification)
    .set({ read: true })
    .where(eq(notification.id, notificationId))
    .returning();
  const row = result[0];
  return {
    ...row,
    id: String(row.id),
  } as Notification;
}

export async function markAllAsRead(userId: string): Promise<void> {
  await db
    .update(notification)
    .set({ read: true })
    .where(and(eq(notification.userId, userId), eq(notification.read, false)));
}

export async function deleteNotification(notificationId: number): Promise<void> {
  await db.delete(notification).where(eq(notification.id, notificationId));
}
