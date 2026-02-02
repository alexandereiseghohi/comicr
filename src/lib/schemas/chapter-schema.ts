import { z } from "zod";

export const ChapterSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  comicId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  number: z.number(),
  content: z.string().optional(),
  images: z.array(z.string()).optional(),
  isPublished: z.boolean(),
  publishedAt: z.date().optional(),
});
