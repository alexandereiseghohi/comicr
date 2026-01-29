import { z } from "zod";

export const UserSeedSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  image: z.string().optional(),
});

export const ComicSeedSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  slug: z.string().min(1),
  authorId: z.number().int(),
  artistId: z.number().int().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  publicationDate: z.string().min(1), // required, non-null, non-optional
});

export const ChapterSeedSchema = z.object({
  id: z.number().int(),
  comicId: z.number().int(),
  title: z.string().min(1),
  slug: z.string().min(1),
  images: z.array(z.string()),
  releaseDate: z.string().optional(),
});

export function normalizeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/")) return url;
  if (/^https?:\/\//.test(url)) return url;
  return "/" + url;
}

export function normalizeImageArray(arr: string[]): string[] {
  return arr.map(normalizeImageUrl);
}
