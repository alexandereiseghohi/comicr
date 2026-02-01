import { z } from "zod";

/**
 * Reader Settings Schema
 * Validates reader preferences that sync across devices
 */
export const readerSettingsSchema = z.object({
  userId: z.string(),
  backgroundMode: z.enum(["white", "dark", "sepia"]).default("white"),
  readingMode: z.enum(["vertical", "horizontal"]).default("vertical"),
  defaultQuality: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateReaderSettingsSchema = z.object({
  backgroundMode: z.enum(["white", "dark", "sepia"]).optional(),
  readingMode: z.enum(["vertical", "horizontal"]).optional(),
  defaultQuality: z.enum(["low", "medium", "high"]).optional(),
});

export type ReaderSettings = z.infer<typeof readerSettingsSchema>;
export type UpdateReaderSettingsInput = z.infer<typeof updateReaderSettingsSchema>;
