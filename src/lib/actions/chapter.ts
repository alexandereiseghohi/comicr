"use server";

import * as chapterMutations from "@/database/mutations/chapter-mutations";
import { auth } from "@/lib/auth-config";
import type { CreateChapterInput, UpdateChapterInput } from "@/schemas/chapter-schema";
import { createChapterSchema, updateChapterSchema } from "@/schemas/chapter-schema";
import type { ActionResult } from "@/types";
import type { AuthUser } from "@/types/auth";
import { revalidatePath } from "next/cache";

/**
 * Create a new chapter (admin only)
 */
export async function createChapterAction(
  input: CreateChapterInput
): Promise<ActionResult<{ id: number }>> {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const validation = createChapterSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const result = await chapterMutations.createChapter(validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/chapters");
    revalidatePath("/admin/chapters");

    return { success: true, data: { id: Number(result.data?.id) || 0 } };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Update a chapter (admin only)
 */
export async function updateChapterAction(
  id: number,
  input: UpdateChapterInput
): Promise<ActionResult<{ id: number }>> {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const validation = updateChapterSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const result = await chapterMutations.updateChapter(id, validation.data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/chapters");
    revalidatePath(`/chapters/${id}`);
    revalidatePath("/admin/chapters");

    return { success: true, data: { id: Number(result.data?.id) || 0 } };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a chapter (admin only)
 */
export async function deleteChapterAction(id: number): Promise<ActionResult<null>> {
  try {
    const session = await auth();
    const user = session?.user as AuthUser | undefined;

    if (!user?.id || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const result = await chapterMutations.deleteChapter(id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/chapters");
    revalidatePath("/admin/chapters");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
