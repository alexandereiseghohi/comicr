"use server"
import { auth } from "@/auth";
import * as mutations from "@/database/mutations/rating-mutations";
import * as queries from "@/database/queries/rating-queries";
import { type RatingInput, ratingSchema } from "@/schemas/rating.schema";
import { type ActionResult } from "@/types";

/**
 * Get user's rating for a comic
 */
export async function getUserRatingAction(
  comicId: number
): Promise<ActionResult<{ rating: number; review: null | string } | null>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        error: "Unauthorized - please sign in to rate comics",
      };
    }

    const result = await queries.getUserRating(session.user.id, comicId);

    if (!result.success || !result.data) {
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: {
        rating: result.data.rating,
        review: result.data.review || null,
      },
    };
  } catch (error) {
    console.error("Get user rating error:", error);
    return { ok: false, error: "Failed to fetch rating" };
  }
}

/**
 * Get average rating and count for a comic
 */
export async function getComicRatingStatsAction(
  comicId: number
): Promise<ActionResult<{ averageRating: number; totalRatings: number }>> {
  try {
    const result = await queries.getComicRatingStats(comicId);

    if (!result.success) {
      return {
        ok: false,
        error: result.error || "Failed to fetch rating stats",
      };
    }

    return {
      ok: true,
      data: {
        averageRating: result.data?.averageRating || 0,
        totalRatings: result.data?.totalRatings || 0,
      },
    };
  } catch (error) {
    console.error("Get rating stats error:", error);
    return { ok: false, error: "Failed to fetch rating statistics" };
  }
}

/**
 * Create or update user's rating for a comic
 */
export async function upsertRatingAction(input: RatingInput): Promise<ActionResult<{ rating: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        ok: false,
        error: "Unauthorized - please sign in to rate comics",
      };
    }

    // Validate input
    const validation = ratingSchema.safeParse(input);
    if (!validation.success) {
      return {
        ok: false,
        error: validation.error.issues[0]?.message || "Invalid rating data",
      };
    }

    const result = await mutations.upsertRating({
      userId: session.user.id,
      comicId: validation.data.comicId,
      rating: validation.data.rating,
      review: validation.data.review,
    });

    if (!result.success) {
      return { ok: false, error: result.error || "Failed to save rating" };
    }

    return {
      ok: true,
      data: { rating: validation.data.rating },
    };
  } catch (error) {
    console.error("Upsert rating error:", error);
    return {
      ok: false,
      error: "An unexpected error occurred while saving your rating",
    };
  }
}

/**
 * Delete user's rating for a comic
 */
export async function deleteRatingAction(comicId: number): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, error: "Unauthorized" };
    }

    const result = await mutations.deleteRating(session.user.id, comicId);

    if (!result.success) {
      return { ok: false, error: result.error || "Failed to delete rating" };
    }

    return { ok: true, data: { deleted: true } };
  } catch (error) {
    console.error("Delete rating error:", error);
    return { ok: false, error: "Failed to delete rating" };
  }
}
