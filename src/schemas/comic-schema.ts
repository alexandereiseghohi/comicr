/**
 * Comic Zod Validation Schemas
 * @description Type-safe validation for comic operations
 */

import { slugValidator } from "@/types/validation";
import { z } from "zod";

/**
 * Create Comic Schema
 */
export const createComicSchema = z.object({
  title: z.string().min(1, "Title required").max(255, "Title too long"),
  description: z.string().min(10, "Description too short").max(2000),
  coverImage: z.string().url("Invalid URL"),
  slug: slugValidator,
  status: z.enum(["Ongoing", "Hiatus", "Completed", "Dropped", "Season End", "Coming Soon"]),
  publicationDate: z.coerce.date(),
  authorId: z.number().int().positive(),
  artistId: z.number().int().positive().optional(),
  typeId: z.number().int().positive(),
});

/**
 * Update Comic Schema (all fields optional)
 */
export const updateComicSchema = createComicSchema.partial();

/**
 * Type inference from schemas
 */
export type CreateComicInput = z.infer<typeof createComicSchema>;
export type UpdateComicInput = z.infer<typeof updateComicSchema>;
