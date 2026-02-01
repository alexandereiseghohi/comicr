import { z } from "zod";

/**
 * Rating Schema
 * Validates comic ratings (1-5 stars)
 */
export const ratingSchema = z.object({
  comicId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional(),
});

export const upsertRatingSchema = z.object({
  comicId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional().nullable(),
});

export type RatingInput = z.infer<typeof ratingSchema>;
export type UpsertRatingInput = z.infer<typeof upsertRatingSchema>;
