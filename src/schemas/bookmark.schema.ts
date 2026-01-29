import { z } from "zod";

export const BookmarkSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  comicId: z.string(),
  createdAt: z.string().optional(),
});

export type Bookmark = z.infer<typeof BookmarkSchema>;
