import { z } from "zod";

/**
 * User Settings Schema
 * Validates user preferences for notifications, privacy, etc.
 */
export const settingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  profileVisibility: z.enum(["public", "private"]).default("public"),
  readingHistoryVisibility: z.boolean().default(true),
});

export const updateSettingsSchema = settingsSchema.partial();

export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
