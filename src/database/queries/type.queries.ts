import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { type } from "@/database/schema";

export async function getTypes() {
  try {
    const results = await db.select().from(type).where(eq(type.isActive, true)).orderBy(type.name);
    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

export async function getTypeById(id: number) {
  try {
    const results = await db
      .select()
      .from(type)
      .where(and(eq(type.id, id), eq(type.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query failed",
    };
  }
}

export async function getTypeByName(name: string) {
  try {
    const results = await db.select().from(type).where(eq(type.name, name)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}
