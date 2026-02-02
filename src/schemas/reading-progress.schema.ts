import { z } from "zod";

/**
 * Reading Progress Schema
 * Validates reading progress data for save/load operations
 */
export const readingProgressSchema = z.object({
  comicId: z.number().int().positive("Comic ID must be a positive integer"),
  chapterId: z.number().int().positive("Chapter ID must be a positive integer"),
  currentImageIndex: z.number().int().min(0, "Image index must be 0 or greater").default(0),
  scrollPercentage: z
    .number()
    .int()
    .min(0, "Scroll percentage must be 0 or greater")
    .max(100, "Scroll percentage cannot exceed 100")
    .default(0),
  progressPercent: z
    .number()
    .int()
    .min(0, "Progress percent must be 0 or greater")
    .max(100, "Progress percent cannot exceed 100")
    .default(0),
});

export const saveReadingProgressSchema = readingProgressSchema;

export const getReadingProgressSchema = z.object({
  comicId: z.number().int().positive("Comic ID must be a positive integer"),
});

export type ReadingProgressInput = z.infer<typeof readingProgressSchema>;
export type SaveReadingProgressInput = z.infer<typeof saveReadingProgressSchema>;
export type GetReadingProgressInput = z.infer<typeof getReadingProgressSchema>;
