"use server";

import { auth } from "@/auth";
import * as mutations from "@/database/mutations/reader-settings-mutations";
import * as progressMutations from "@/database/mutations/reading-progress-mutations";
import {
  updateReaderSettingsSchema,
  type UpdateReaderSettingsInput,
} from "@/schemas/reader-settings.schema";
import type { ActionResult } from "@/types";

/**
 * Get reader settings for the current user
 */
export async function getReaderSettingsAction(): Promise<
  ActionResult<{
    backgroundMode: string;
    readingMode: string;
    defaultQuality: string;
  }>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await mutations.getUserReaderSettings(session.user.id);
  if (!result.success) {
    return { success: false, error: result.error || "Failed to get reader settings" };
  }
  return { success: true, data: result.data };
}

/**
 * Update reader settings for the current user
 */
export async function updateReaderSettingsAction(
  input: UpdateReaderSettingsInput
): Promise<ActionResult<{ success: true }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const validation = updateReaderSettingsSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  const result = await mutations.upsertReaderSettings(session.user.id, validation.data);
  return result.success
    ? { success: true, data: { success: true } }
    : { success: false, error: result.error || "Failed to update reader settings" };
}

/**
 * Save reading progress for a comic chapter
 */
export async function saveReadingProgressAction(input: {
  comicId: number;
  chapterId: number;
  currentImageIndex?: number;
  scrollPercentage?: number;
  progressPercent?: number;
}): Promise<ActionResult<{ saved: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await progressMutations.upsertReadingProgress({
    userId: session.user.id,
    comicId: input.comicId,
    chapterId: input.chapterId,
    currentImageIndex: input.currentImageIndex,
    scrollPercentage: input.scrollPercentage,
    progressPercent: input.progressPercent,
  });

  return result.success
    ? { success: true, data: { saved: true } }
    : { success: false, error: result.error || "Failed to save reading progress" };
}
