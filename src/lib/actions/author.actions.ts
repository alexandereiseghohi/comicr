import * as authorMutations from "@/database/mutations/author.mutations";
import { createAuthorSchema } from "@/lib/schemas/author-schema";

export async function createAuthorAction(formData: unknown) {
  const validation = createAuthorSchema.safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  return await authorMutations.createAuthor(validation.data);
}

export async function updateAuthorAction(id: number, formData: unknown) {
  // allow partial updates
  const validation = createAuthorSchema.partial().safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  const result = await authorMutations.updateAuthor(id, validation.data);
  return result;
}
