import * as chapterMutations from "@/database/mutations/chapter.mutations";
import { createChapterSchema } from "@/lib/schemas/chapter-schema";

export async function createChapterAction(formData: unknown) {
  const validation = createChapterSchema.safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  return await chapterMutations.createChapter(validation.data);
}

export async function updateChapterAction(id: number, formData: unknown) {
  const validation = createChapterSchema.partial().safeParse(formData);
  if (!validation.success) return { success: false, error: validation.error.issues[0]?.message };
  return await chapterMutations.updateChapter(id, validation.data);
}
