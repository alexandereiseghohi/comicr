/**
 * Admin Server Actions
 * @description Server actions for admin operations with role verification
 */

"use server";

import { db } from "@/database/db";
import { chapter, comic, user } from "@/database/schema";
import { auth } from "@/lib/auth-config";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/**
 * Verify admin role before executing action
 */
async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;

  if (!currentUser?.id || currentUser.role !== "admin") {
    return null;
  }

  return { userId: currentUser.id };
}

// ============================================================================
// Comic Actions
// ============================================================================

const UpdateComicSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  status: z
    .enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"])
    .optional(),
});

export async function updateComicAction(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const parsed = UpdateComicSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.coverImage !== undefined) updateData.coverImage = parsed.data.coverImage;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

    const result = await db
      .update(comic)
      .set(updateData)
      .where(eq(comic.id, id))
      .returning({ id: comic.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Comic not found" } };
    }

    revalidatePath("/admin/comics");
    revalidatePath(`/comics`);

    return { ok: true, data: result[0] };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Update failed",
      },
    };
  }
}

export async function deleteComicAction(id: number): Promise<ActionResult<null>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  try {
    // Delete associated chapters first
    await db.delete(chapter).where(eq(chapter.comicId, id));

    // Delete the comic
    const result = await db.delete(comic).where(eq(comic.id, id)).returning({ id: comic.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Comic not found" } };
    }

    revalidatePath("/admin/comics");
    revalidatePath("/comics");

    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Delete failed",
      },
    };
  }
}

export async function bulkDeleteComicsAction(
  ids: number[]
): Promise<ActionResult<{ count: number }>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  if (!ids.length) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "No IDs provided" } };
  }

  try {
    // Delete chapters for all comics
    await db.delete(chapter).where(inArray(chapter.comicId, ids));

    // Delete comics
    const result = await db.delete(comic).where(inArray(comic.id, ids)).returning({ id: comic.id });

    revalidatePath("/admin/comics");
    revalidatePath("/comics");

    return { ok: true, data: { count: result.length } };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Bulk delete failed",
      },
    };
  }
}

// ============================================================================
// Chapter Actions
// ============================================================================

const UpdateChapterSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  number: z.number().min(0).optional(),
});

export async function updateChapterAction(
  id: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const parsed = UpdateChapterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const result = await db
      .update(chapter)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(chapter.id, id))
      .returning({ id: chapter.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Chapter not found" } };
    }

    revalidatePath("/admin/chapters");

    return { ok: true, data: result[0] };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Update failed",
      },
    };
  }
}

export async function deleteChapterAction(id: number): Promise<ActionResult<null>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  try {
    const result = await db.delete(chapter).where(eq(chapter.id, id)).returning({ id: chapter.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Chapter not found" } };
    }

    revalidatePath("/admin/chapters");

    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Delete failed",
      },
    };
  }
}

export async function bulkDeleteChaptersAction(
  ids: number[]
): Promise<ActionResult<{ count: number }>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  if (!ids.length) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "No IDs provided" } };
  }

  try {
    const result = await db
      .delete(chapter)
      .where(inArray(chapter.id, ids))
      .returning({ id: chapter.id });

    revalidatePath("/admin/chapters");

    return { ok: true, data: { count: result.length } };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Bulk delete failed",
      },
    };
  }
}

// ============================================================================
// User Actions
// ============================================================================

const UpdateUserRoleSchema = z.object({
  role: z.enum(["admin", "moderator", "user"]),
});

export async function updateUserRoleAction(
  userId: string,
  input: unknown
): Promise<ActionResult<{ id: string; role: string }>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Prevent self-demotion
  if (userId === admin.userId) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Cannot change your own role" } };
  }

  const parsed = UpdateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  try {
    const result = await db
      .update(user)
      .set({ role: parsed.data.role })
      .where(eq(user.id, userId))
      .returning({ id: user.id, role: user.role });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    revalidatePath("/admin/users");

    return { ok: true, data: { id: result[0].id, role: result[0].role ?? "user" } };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: error instanceof Error ? error.message : "Update failed",
      },
    };
  }
}

export async function banUserAction(userId: string): Promise<ActionResult<null>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Prevent self-ban
  if (userId === admin.userId) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Cannot ban yourself" } };
  }

  try {
    // Set emailVerified to null to effectively disable the account
    const result = await db
      .update(user)
      .set({ emailVerified: null })
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    revalidatePath("/admin/users");

    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: error instanceof Error ? error.message : "Ban failed" },
    };
  }
}

export async function unbanUserAction(userId: string): Promise<ActionResult<null>> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  try {
    const result = await db
      .update(user)
      .set({ emailVerified: new Date() })
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    if (result.length === 0) {
      return { ok: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    revalidatePath("/admin/users");

    return { ok: true, data: null };
  } catch (error) {
    return {
      ok: false,
      error: { code: "DB_ERROR", message: error instanceof Error ? error.message : "Unban failed" },
    };
  }
}
