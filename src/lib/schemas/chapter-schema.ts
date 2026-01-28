import { z } from "zod";

/**
 * Schema for creating a new chapter
 */
export const createChapterSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  chapterNumber: z.number().int().positive(),
  releaseDate: z.coerce.date(),
  comicId: z.number().int().positive(),
  views: z.number().int().nonnegative().optional().default(0),
  url: z.string().url().optional(),
  content: z.string().optional(),
});

/**
 * Schema for updating a chapter (all fields optional)
 */
export const updateChapterSchema = createChapterSchema.partial();

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
