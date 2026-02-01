import * as comicImageMutations from "@/database/mutations/comic-image.mutations";

type CreateComicImageInput = {
  comicId: number;
  imageUrl: string;
  imageOrder: number;
};

export async function createComicImageAction(formData: unknown) {
  // Minimal validation done in mutations; coerce via a safe double-cast to avoid `any`
  const data = formData as unknown as CreateComicImageInput;
  return await comicImageMutations.createComicImage(data);
}

export async function deleteComicImageAction(id: number) {
  return await comicImageMutations.deleteComicImage(id);
}
