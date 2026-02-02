"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import * as mutations from "@/database/mutations/genre.mutations";
import { getGenreByName } from "@/database/queries/genre.queries";
import { slugify } from "@/lib/utils";
import { createGenreSchema, updateGenreSchema } from "@/schemas/genre-schema";

type ActionResult<T = unknown> =
  | { data: T; ok: true; }
  | { error: { code: string; message: string }; ok: false; };

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createGenreAction(input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Handle slug auto-generation
  const inputData = input as Record<string, unknown>;
  if (inputData && typeof inputData === "object" && !inputData.slug && inputData.name) {
    inputData.slug = slugify(String(inputData.name));
  }

  const parsed = createGenreSchema.safeParse(inputData);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  // Check unique name
  const existing = await getGenreByName(parsed.data.name);
  if (existing) {
    return { ok: false, error: { code: "DUPLICATE", message: "Genre name already exists" } };
  }

  const result = await mutations.createGenre(parsed.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Creation failed" } };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: result.data };
}

export async function updateGenreAction(id: number, input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const parsed = updateGenreSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  // Check unique name if name is being updated
  if (parsed.data.name) {
    const existing = await getGenreByName(parsed.data.name);
    if (existing && existing.id !== id) {
      return { ok: false, error: { code: "DUPLICATE", message: "Genre name already exists" } };
    }
  }

  const result = await mutations.updateGenre(id, parsed.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Update failed" } };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: result.data };
}

export async function deleteGenreAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Soft delete: set isActive = false
  const result = await mutations.updateGenre(id, { isActive: false });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Delete failed" } };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: { id } };
}

export async function restoreGenreAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const result = await mutations.updateGenre(id, { isActive: true });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Restore failed" } };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: { id } };
}

export async function bulkDeleteGenresAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(
    ids.map((id) => mutations.updateGenre(id, { isActive: false }))
  );
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: { count: ids.length } };
}

export async function bulkRestoreGenresAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(ids.map((id) => mutations.updateGenre(id, { isActive: true })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/genres");
  return { ok: true, data: { count: ids.length } };
}
