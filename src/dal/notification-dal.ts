import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import type { DbNotification } from "@/database/mutations/notification-mutations";
import * as mutations from "@/database/mutations/notification-mutations";
import { notification } from "@/database/schema";
import { type DbMutationResult } from "@/types";

import { BaseDAL } from "./base-dal";

export class NotificationDAL extends BaseDAL<typeof notification> {
  constructor() {
    super(notification);
  }

  async getById(id: number) {
    try {
      const result = await db.query.notification.findFirst({
        where: eq(notification.id, id),
        with: { user: true },
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch",
      };
    }
  }

  async create(
    data: typeof notification.$inferInsert,
  ): Promise<DbMutationResult<DbNotification>> {
    try {
      const result = await mutations.createNotification(
        data.userId,
        data.type,
        data.title,
        data.message,
        data.link ?? undefined,
        data.comicId ?? undefined,
        data.chapterId ?? undefined,
      );
      if (result && typeof result === "object" && "id" in result) {
        return { success: true, data: result as DbNotification };
      } else {
        return { success: false, error: "Create failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Create failed",
      };
    }
  }

  async update(
    id: number,
    _data: Partial<typeof notification.$inferInsert>,
  ): Promise<DbMutationResult<DbNotification>> {
    try {
      const result = await mutations.markAsRead(id);
      if (result && typeof result === "object" && "id" in result) {
        return { success: true, data: result };
      } else {
        return { success: false, error: "Update failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  }

  async delete(id: number): Promise<DbMutationResult<null>> {
    try {
      await mutations.deleteNotification(id);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }
}

export const notificationDAL = new NotificationDAL();
