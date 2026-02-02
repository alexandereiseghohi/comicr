import { eq, inArray } from "drizzle-orm";

import { db } from "@/database/db";
import { type } from "@/database/schema";
import { type CreateTypeInput, type UpdateTypeInput } from "@/schemas/type-schema";

export async function createType(data: CreateTypeInput) {
  try {
    const result = await db.insert(type).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateType(id: number, data: UpdateTypeInput) {
  try {
    const result = await db.update(type).set(data).where(eq(type.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function deleteType(id: number) {
  try {
    await db.delete(type).where(eq(type.id, id));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deletion failed",
    };
  }
}

export async function setTypeActive(id: number, isActive: boolean) {
  try {
    const result = await db.update(type).set({ isActive }).where(eq(type.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function bulkSetTypesActive(ids: number[], isActive: boolean) {
  try {
    await db.update(type).set({ isActive }).where(inArray(type.id, ids));
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Bulk update failed",
    };
  }
}
