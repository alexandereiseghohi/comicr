import { db } from "@/database/db";
import { type as typeTable } from "@/database/schema";
import type { CreateTypeInput, UpdateTypeInput } from "@/lib/schemas/type-schema";
import { eq } from "drizzle-orm";

export async function createType(data: CreateTypeInput) {
  try {
    const result = await db.insert(typeTable).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function updateType(id: number, data: UpdateTypeInput) {
  try {
    const result = await db.update(typeTable).set(data).where(eq(typeTable.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function deleteType(id: number) {
  try {
    await db.delete(typeTable).where(eq(typeTable.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
