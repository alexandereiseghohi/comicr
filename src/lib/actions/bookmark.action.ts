import * as mutations from "@/database/mutations/bookmark.mutations";
import { CreateBookmarkInput, CreateBookmarkSchema } from "@/schemas/bookmark.schema";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/**
 * Add a bookmark.
 * Validates input with Zod and returns a consistent action shape.
 */
export async function addBookmarkAction(input: unknown): Promise<ActionResult> {
  const parsed = CreateBookmarkSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const input = parsed.data as CreateBookmarkInput;
    const result = await mutations.addBookmark(input);
    if (!result || !result.success) {
      return { ok: false, error: { code: "DB_ERROR", message: String(result?.error || "failed") } };
    }
    return { ok: true, data: result.data };
  } catch (err) {
    return {
      ok: false,
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
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const result = await mutations.removeBookmark(parsed.data.userId, parsed.data.comicId);
    if (!result || !result.success) {
      return { ok: false, error: { code: "DB_ERROR", message: String(result?.error || "failed") } };
    }
    return { ok: true, data: null };
  } catch (err) {
    return {
      ok: false,
      error: { code: "EXCEPTION", message: String(err instanceof Error ? err.message : err) },
    };
  }
}

export type { ActionResult };
