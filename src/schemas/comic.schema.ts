import { z } from "zod";

export const ComicSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  altTitles: z.array(z.string()).optional(),
  authors: z.array(z.string()).optional(),
  artists: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  status: z.enum(["ongoing", "completed", "hiatus"]).optional(),
  coverUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export type Comic = z.infer<typeof ComicSchema>;
