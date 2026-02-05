import { z } from "zod";

import * as mutations from "@/database/mutations/bookmark.mutations";
import { type CreateBookmarkInput, CreateBookmarkSchema } from "@/schemas/bookmark.schema";

type ActionResult<T = unknown> =
  | { data: T; success: true }
  | { error: { code: string; message: string }; success: false };

/**
 * Add a bookmark.
 * Validates input with Zod and returns a consistent action shape.
 */
export async function addBookmarkAction(input: unknown): Promise<ActionResult> {
  const parsed = CreateBookmarkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const input = parsed.data as CreateBookmarkInput;
    const result = await mutations.addBookmark(input);
    if (!result || !result.success) {
      return { success: false, error: { code: "DB_ERROR", message: String(result?.error || "failed") } };
    }
    return { success: true, data: result.data };
  } catch (err) {
    return {
      success: false,
      error: { code: "EXCEPTION", message: String(err instanceof Error ? err.message : err) },
    };
  }
}

/**
 * Remove a bookmark.
 * Input must be { userId: string, comicId: number }
 */
const RemoveBookmarkSchema = z.object({ userId: z.string(), comicId: z.number() });

export async function removeBookmarkAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = RemoveBookmarkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const result = await mutations.removeBookmark(parsed.data.userId, parsed.data.comicId);
    if (!result || !result.success) {
      return { success: false, error: { code: "DB_ERROR", message: String(result?.error || "failed") } };
    }
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: { code: "EXCEPTION", message: String(err instanceof Error ? err.message : err) },
    };
  }
}

export type { ActionResult };
