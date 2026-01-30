import { z } from "zod";
export const AuthorSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  biography: z.string().optional(),
  website: z.string().optional(),
  socialMedia: z
    .object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      discord: z.string().optional(),
    })
    .optional(),
});
