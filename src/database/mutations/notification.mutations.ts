import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { notification } from "@/database/schema";

// Local type matching DB notification schema
export type DbNotification = {
  chapterId: null | number;
  comicId: null | number;
  createdAt: Date;
  id: number;
  link: null | string;
  message: string;
  read: boolean;
  title: string;
  type: string;
  userId: string;
};

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  comicId?: number,
  chapterId?: number
): Promise<DbNotification> {
  const result = await db
    .insert(notification)
    .values({ userId, type, title, message, link, comicId, chapterId })
    .returning();
  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link ?? null,
    read: row.read ?? false,
    comicId: row.comicId ?? null,
    chapterId: row.chapterId ?? null,
    createdAt: row.createdAt ?? new Date(),
  };
}

export async function markAsRead(notificationId: number): Promise<DbNotification> {
  const result = await db
    .update(notification)
    .set({ read: true })
    .where(eq(notification.id, notificationId))
    .returning();
  const row = result[0];
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link ?? null,
    read: row.read ?? false,
    comicId: row.comicId ?? null,
    chapterId: row.chapterId ?? null,
    createdAt: row.createdAt ?? new Date(),
  };
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
