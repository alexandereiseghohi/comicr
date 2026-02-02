"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import * as authorMutations from "@/database/mutations/author.mutations";
import { getAuthorByName } from "@/database/queries/author.queries";
import { createAuthorSchema } from "@/schemas/author-schema";

type ActionResult<T = unknown> =
  | { data: T; ok: true; }
  | { error: { code: string; message: string }; ok: false; };

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createAuthorAction(formData: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const validation = createAuthorSchema.safeParse(formData);
  if (!validation.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message ?? "Validation failed",
      },
    };
  }

  // Check unique name
  const existing = await getAuthorByName(validation.data.name);
  if (existing) {
    return { ok: false, error: { code: "DUPLICATE", message: "Author name already exists" } };
  }

  const result = await authorMutations.createAuthor(validation.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Creation failed" } };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: result.data };
}

export async function updateAuthorAction(id: number, formData: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const validation = createAuthorSchema.partial().safeParse(formData);
  if (!validation.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message ?? "Validation failed",
      },
    };
  }

  // Check unique name if name is being updated
  if (validation.data.name) {
    const existing = await getAuthorByName(validation.data.name);
    if (existing && existing.id !== id) {
      return { ok: false, error: { code: "DUPLICATE", message: "Author name already exists" } };
    }
  }

  const result = await authorMutations.updateAuthor(id, validation.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Update failed" } };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: result.data };
}

export async function deleteAuthorAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Soft delete: set isActive = false
  const result = await authorMutations.updateAuthor(id, { isActive: false });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Delete failed" } };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: { id } };
}

export async function restoreAuthorAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const result = await authorMutations.updateAuthor(id, { isActive: true });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Restore failed" } };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: { id } };
}

export async function bulkDeleteAuthorsAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(
    ids.map((id) => authorMutations.updateAuthor(id, { isActive: false }))
  );
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: { count: ids.length } };
}

export async function bulkRestoreAuthorsAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(
    ids.map((id) => authorMutations.updateAuthor(id, { isActive: true }))
  );
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/authors");
  return { ok: true, data: { count: ids.length } };
}
