import { z } from "zod";

export const ChapterSchema = z.object({
  id: z.string().optional(),
  comicId: z.string(),
  number: z.number(),
  title: z.string().optional(),
  pages: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
});

export type Chapter = z.infer<typeof ChapterSchema>;
