import { z } from "zod";
export const ContentTypeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.enum(["Manga", "Manhwa", "Manhua", "Comic", "Light Novel"]),
  description: z.string().optional(),
});
