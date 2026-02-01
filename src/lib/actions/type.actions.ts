"use server";

import { auth } from "@/auth";
import * as mutations from "@/database/mutations/type.mutations";
import { getTypeByName } from "@/database/queries/type.queries";
import { createTypeSchema, updateTypeSchema } from "@/schemas/type-schema";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createTypeAction(input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const parsed = createTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  // Check unique name
  const existing = await getTypeByName(parsed.data.name);
  if (existing) {
    return { ok: false, error: { code: "DUPLICATE", message: "Type name already exists" } };
  }

  const result = await mutations.createType(parsed.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Creation failed" } };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: result.data };
}

export async function updateTypeAction(id: number, input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const parsed = updateTypeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } };
  }

  // Check unique name if name is being updated
  if (parsed.data.name) {
    const existing = await getTypeByName(parsed.data.name);
    if (existing && existing.id !== id) {
      return { ok: false, error: { code: "DUPLICATE", message: "Type name already exists" } };
    }
  }

  const result = await mutations.updateType(id, parsed.data);
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Update failed" } };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: result.data };
}

export async function deleteTypeAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  // Soft delete: set isActive = false
  const result = await mutations.updateType(id, { isActive: false });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Delete failed" } };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: { id } };
}

export async function restoreTypeAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const result = await mutations.updateType(id, { isActive: true });
  if (!result.success) {
    return { ok: false, error: { code: "DB_ERROR", message: result.error ?? "Restore failed" } };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: { id } };
}

export async function bulkDeleteTypesAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(ids.map((id) => mutations.updateType(id, { isActive: false })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: { count: ids.length } };
}

export async function bulkRestoreTypesAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } };
  }

  const results = await Promise.all(ids.map((id) => mutations.updateType(id, { isActive: true })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      ok: false,
      error: { code: "PARTIAL_FAILURE", message: `${failed.length} of ${ids.length} failed` },
    };
  }

  revalidatePath("/admin/types");
  return { ok: true, data: { count: ids.length } };
}
