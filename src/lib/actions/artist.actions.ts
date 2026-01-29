import * as artistMutations from "@/database/mutations/artist.mutations";
import { createArtistSchema } from "@/schemas/artist-schema";

export async function createArtistAction(formData: unknown) {
  const validation = createArtistSchema.safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  return await artistMutations.createArtist(validation.data);
}

export async function updateArtistAction(id: number, formData: unknown) {
  const validation = createArtistSchema.partial().safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  const result = await artistMutations.updateArtist(id, validation.data);
  return result;
}
