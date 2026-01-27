import { z } from "zod";

export const createArtistSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
});

export const updateArtistSchema = createArtistSchema.partial();

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
