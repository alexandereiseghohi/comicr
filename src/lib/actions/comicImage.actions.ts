import * as comicImageMutations from "@/database/mutations/comicImage.mutations";

export async function createComicImageAction(formData: unknown) {
  // Minimal validation done in mutations; caller should ensure types
  return await comicImageMutations.createComicImage(formData as any);
}

export async function deleteComicImageAction(id: number) {
  return await comicImageMutations.deleteComicImage(id);
}
