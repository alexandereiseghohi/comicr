"use server";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import * as artistMutations from "@/database/mutations/artist.mutations";
import { getArtistByName } from "@/database/queries/artist.queries";
import { createArtistSchema } from "@/schemas/artist-schema";

type ActionResult<T = unknown> =
  | { data: T; success: true }
  | { error: { code: string; message: string }; success: false };

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createArtistAction(formData: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const validation = createArtistSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message ?? "Validation failed",
      },
    };
  }

  // Check unique name
  const existing = await getArtistByName(validation.data.name);
  if (existing) {
    return { success: false, error: { code: "DUPLICATE", message: "Artist name already exists" } };
  }

  const result = await artistMutations.createArtist(validation.data);
  if (!result.success) {
    return { success: false, error: { code: "DB_ERROR", message: result.error ?? "Creation failed" } };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: result.data };
}

export async function updateArtistAction(id: number, formData: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const validation = createArtistSchema.partial().safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message ?? "Validation failed",
      },
    };
  }

  // Check unique name if name is being updated
  if (validation.data.name) {
    const existing = await getArtistByName(validation.data.name);
    if (existing && existing.id !== id) {
      return { success: false, error: { code: "DUPLICATE", message: "Artist name already exists" } };
    }
  }

  const result = await artistMutations.updateArtist(id, validation.data);
  if (!result.success) {
    return { success: false, error: { code: "DB_ERROR", message: result.error ?? "Update failed" } };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: result.data };
}

export async function deleteArtistAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Soft delete: set isActive = false
  const result = await artistMutations.updateArtist(id, { isActive: false });
  if (!result.success) {
    return { success: false, error: { code: "DB_ERROR", message: result.error ?? "Delete failed" } };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: { id } };
}

export async function restoreArtistAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const result = await artistMutations.updateArtist(id, { isActive: true });
  if (!result.success) {
    return { success: false, error: { code: "DB_ERROR", message: result.error ?? "Restore failed" } };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: { id } };
}

export async function bulkDeleteArtistsAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(ids.map((id) => artistMutations.updateArtist(id, { isActive: false })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: { count: ids.length } };
}

export async function bulkRestoreArtistsAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(ids.map((id) => artistMutations.updateArtist(id, { isActive: true })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/artists");
  return { success: true, data: { count: ids.length } };
}
