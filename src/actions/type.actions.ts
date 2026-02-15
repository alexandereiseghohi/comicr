"use server";
// Deduplicated string literals
const ADMIN_UNAUTHORIZED = "UNAUTHORIZED: Admin access required";
const ADMIN_ACCESS_REQUIRED = "Admin access required";
const REVALIDATE_PATH = "/admin/types";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import * as mutations from "@/database/mutations/type.mutations";
import { getTypeByName } from "@/database/queries/type.queries";
import { createTypeSchema, updateTypeSchema } from "@/schemas/type-schema";
import { type ActionResult } from "@/types";

async function verifyAdmin(): Promise<{ userId: string } | null> {
  const session = await auth();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;
  if (!currentUser?.id || currentUser.role !== "admin") return null;
  return { userId: currentUser.id };
}

export async function createTypeAction(input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_UNAUTHORIZED };
  }

  const parsed = createTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `VALIDATION_ERROR: ${parsed.error.message}`,
    };
  }

  // Check unique name
  const existing = await getTypeByName(parsed.data.name);
  if (existing) {
    return {
      success: false,
      error: "DUPLICATE: Type name already exists",
    };
  }

  const result = await mutations.createType(parsed.data);
  if (!result.success) {
    return {
      success: false,
      error: `DB_ERROR: ${result.error ?? "Creation failed"}`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function updateTypeAction(id: number, input: unknown): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_UNAUTHORIZED };
  }

  const parsed = updateTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `VALIDATION_ERROR: ${parsed.error.message}`,
    };
  }

  // Check unique name if name is being updated
  if (parsed.data.name) {
    const existing = await getTypeByName(parsed.data.name);
    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "DUPLICATE: Type name already exists",
      };
    }
  }

  const result = await mutations.updateType(id, parsed.data);
  if (!result.success) {
    return {
      success: false,
      error: `DB_ERROR: ${result.error ?? "Update failed"}`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: result.data };
}

export async function deleteTypeAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_UNAUTHORIZED };
  }

  // Soft delete: set isActive = false
  const result = await mutations.updateType(id, { isActive: false });
  if (!result.success) {
    return {
      success: false,
      error: `DB_ERROR: ${result.error ?? "Delete failed"}`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: { id } };
}

export async function restoreTypeAction(id: number): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_UNAUTHORIZED };
  }

  const result = await mutations.updateType(id, { isActive: true });
  if (!result.success) {
    return {
      success: false,
      error: `DB_ERROR: ${result.error ?? "Restore failed"}`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: { id } };
}

export async function bulkDeleteTypesAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_ACCESS_REQUIRED };
  }

  const results = await Promise.all(ids.map((id) => mutations.updateType(id, { isActive: false })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      error: `PARTIAL_FAILURE: ${failed.length} of ${ids.length} failed`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: { count: ids.length } };
}

export async function bulkRestoreTypesAction(ids: number[]): Promise<ActionResult> {
  const admin = await verifyAdmin();
  if (!admin) {
    return { success: false, error: ADMIN_ACCESS_REQUIRED };
  }

  const results = await Promise.all(ids.map((id) => mutations.updateType(id, { isActive: true })));
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return {
      success: false,
      error: `PARTIAL_FAILURE: ${failed.length} of ${ids.length} failed`,
    };
  }

  revalidatePath(REVALIDATE_PATH);
  return { success: true, data: { count: ids.length } };
}
