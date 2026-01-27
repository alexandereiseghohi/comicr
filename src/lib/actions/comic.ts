/**
 * Comic Server Actions
 * @description Server-side mutations for comics with authentication
 */

"use server";

import * as comicMutations from "@/database/mutations/comic-mutations";
import { auth } from "@/lib/auth-config";
import {
  createComicSchema,
  updateComicSchema,
  type CreateComicInput,
  type UpdateComicInput,
} from "@/lib/schemas/comic-schema";
import type { ActionResult } from "@/types";
import type { AuthUser } from "@/types/auth";
import { revalidatePath } from "next/cache";

/**
 * Create Comic Server Action
 * @description Creates a new comic (admin only)
 */
export async function createComicAction(
  input: CreateComicInput
): Promise<ActionResult<{ id: number }>> {
  // Auth check
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user?.id || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  // Validate
  const validation = createComicSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const result = await comicMutations.createComic(validation.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/comics");
    return { success: true, data: { id: result.data?.id || 0 } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Update Comic Server Action
 */
export async function updateComicAction(
  id: number,
  input: UpdateComicInput
): Promise<ActionResult<{ id: number }>> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user?.id || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const validation = updateComicSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message };
  }

  try {
    const result = await comicMutations.updateComic(id, validation.data);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath(`/comics/${id}`);
    revalidatePath("/comics");
    return { success: true, data: { id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Delete Comic Server Action
 */
export async function deleteComicAction(id: number): Promise<ActionResult<null>> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user?.id || user?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await comicMutations.deleteComic(id);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/comics");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
