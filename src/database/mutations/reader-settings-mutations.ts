import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { readerSettings } from "@/database/schema";

/**
 * Get reader settings for a user
 */
export async function getUserReaderSettings(userId: string) {
  try {
    const settings = await db.query.readerSettings.findFirst({
      where: eq(readerSettings.userId, userId),
    });

    return {
      success: true,
      data: settings || {
        backgroundMode: "white",
        readingMode: "vertical",
        defaultQuality: "medium",
      },
    };
  } catch (error) {
    console.error("Error getting reader settings:", error);
    return {
      success: false,
      error: "Failed to get reader settings",
    };
  }
}

/**
 * Create or update reader settings for a user
 */
export async function upsertReaderSettings(
  userId: string,
  settings: {
    backgroundMode?: "dark" | "sepia" | "white";
    defaultQuality?: "high" | "low" | "medium";
    readingMode?: "horizontal" | "vertical";
  }
) {
  try {
    const existing = await db.query.readerSettings.findFirst({
      where: eq(readerSettings.userId, userId),
    });

    if (existing) {
      const [updated] = await db
        .update(readerSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(readerSettings.userId, userId))
        .returning();

      return {
        success: true,
        data: updated,
      };
    } else {
      const [created] = await db
        .insert(readerSettings)
        .values({
          userId,
          backgroundMode: settings.backgroundMode || "white",
          readingMode: settings.readingMode || "vertical",
          defaultQuality: settings.defaultQuality || "medium",
        })
        .returning();

      return {
        success: true,
        data: created,
      };
    }
  } catch (error) {
    console.error("Error upserting reader settings:", error);
    return {
      success: false,
      error: "Failed to update reader settings",
    };
  }
}
