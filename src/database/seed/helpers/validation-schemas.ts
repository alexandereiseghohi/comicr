/**
 * @file validation-schemas.ts
 * @description Zod schemas for all seed entities
 * @author ComicWise Team
 * @date 2026-01-30
 */

import { z } from "zod";

export const UserSeedSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  avatar: z.string().url().optional(),
});

export const ComicSeedSchema = z.object({
  title: z.string(),
  slug: z.string(),
  cover: z.string().url().optional(),
  genres: z.array(z.string()),
  authors: z.array(z.string()),
  artists: z.array(z.string()),
  type: z.string(),
});

export const ChapterSeedSchema = z.object({
  comicSlug: z.string(),
  chapterNumber: z.number(),
  title: z.string(),
  images: z.array(z.string().url()),
  releaseDate: z.string().optional(),
});

export type UserSeed = z.infer<typeof UserSeedSchema>;
export type ComicSeed = z.infer<typeof ComicSeedSchema>;
export type ChapterSeed = z.infer<typeof ChapterSeedSchema>;
