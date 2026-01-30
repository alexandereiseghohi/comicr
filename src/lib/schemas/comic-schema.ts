import { z } from "zod";
export const ComicSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  slug: z.string(),
  status: z.enum(["Ongoing", "Completed", "OnHold"]),
  authorId: z.string().uuid(),
  artistId: z.string().uuid().optional(),
  views: z.number(),
  rating: z.number(),
  isPublished: z.boolean(),
});
