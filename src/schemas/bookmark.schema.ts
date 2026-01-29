import { z } from "zod";

export const BookmarkSchema = z.object({
  userId: z.string(),
  comicId: z.number(),
  lastReadChapterId: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
});

export const CreateBookmarkSchema = BookmarkSchema.pick({ userId: true, comicId: true }).partial(
  {}
);

export type Bookmark = z.infer<typeof BookmarkSchema>;
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;
