import { z } from "zod";

/**
 * Schema for adding a bookmark
 * Only userId and comicId are required for basic bookmark creation
 */
export const addBookmarkSchema = z.object({
  userId: z.string().min(1),
  comicId: z.number().int().positive(),
  lastReadChapterId: z.number().int().positive().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type AddBookmarkInput = z.infer<typeof addBookmarkSchema>;
