"use server";
import { auth } from "@/auth";
import * as mutations from "@/database/mutations/reader-settings-mutations";
import * as progressMutations from "@/database/mutations/reading-progress-mutations";
import {
  type UpdateReaderSettingsInput,
  updateReaderSettingsSchema,
} from "@/schemas/reader-settings.schema";
import {
  getReadingProgressSchema,
  type SaveReadingProgressInput,
  saveReadingProgressSchema,
} from "@/schemas/reading-progress.schema";
import { type ActionResult } from "@/types";

/**
 * Get reader settings for the current user
 */
export async function getReaderSettingsAction(): Promise<
  ActionResult<{
    backgroundMode: string;
    defaultQuality: string;
    readingMode: string;
  }>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const result = await mutations.getUserReaderSettings(session.user.id);
  if (!result.success) {
    return {
      ok: false,
      error: result.error || "Failed to get reader settings",
    };
  }
  return { ok: true, data: result.data };
}

/**
 * Update reader settings for the current user
 */
export async function updateReaderSettingsAction(
  input: UpdateReaderSettingsInput,
): Promise<ActionResult<{ success: true }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const validation = updateReaderSettingsSchema.safeParse(input);
  if (!validation.success) {
    return {
      ok: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const result = await mutations.upsertReaderSettings(
    session.user.id,
    validation.data,
  );
  return result.success
    ? { ok: true, data: { success: true } }
    : {
        ok: false,
        error: result.error || "Failed to update reader settings",
      };
}

/**
 * Save reading progress for a comic chapter
 */
export async function saveReadingProgressAction(
  input: SaveReadingProgressInput,
): Promise<ActionResult<{ saved: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const validation = saveReadingProgressSchema.safeParse(input);
  if (!validation.success) {
    return {
      ok: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const result = await progressMutations.upsertReadingProgress({
    userId: session.user.id,
    ...validation.data,
  });

  return result.success
    ? { ok: true, data: { saved: true } }
    : {
        ok: false,
        error: result.error || "Failed to save reading progress",
      };
}

/**
 * Get reading progress for a comic
 */
export async function getReadingProgressAction(input: {
  comicId: number;
}): Promise<
  ActionResult<{
    chapterId: number;
    currentImageIndex: number;
    progressPercent: number;
    scrollPercentage: number;
  } | null>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const validation = getReadingProgressSchema.safeParse(input);
  if (!validation.success) {
    return {
      ok: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const result = await progressMutations.getReadingProgress(
    session.user.id,
    validation.data.comicId,
  );

  if (!result) {
    return { ok: true, data: null };
  }

  return {
    ok: true,
    data: {
      chapterId: result.chapterId,
      currentImageIndex: result.currentImageIndex ?? 0,
      scrollPercentage: result.scrollPercentage ?? 0,
      progressPercent: result.progressPercent ?? 0,
    },
  };
}
