import { z } from "zod";

export const ArtistSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  biography: z.string().optional(),
  portfolio: z.string().optional(),
  website: z.string().optional(),
});
