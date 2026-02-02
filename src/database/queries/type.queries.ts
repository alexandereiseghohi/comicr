import { and, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { type as typeTable } from "@/database/schema";

export async function getTypes() {
  try {
    const results = await db
      .select()
      .from(typeTable)
      .where(eq(typeTable.isActive, true))
      .orderBy(typeTable.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getTypeById(id: number) {
  try {
    const results = await db
      .select()
      .from(typeTable)
      .where(and(eq(typeTable.id, id), eq(typeTable.isActive, true)))
      .limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getTypeByName(name: string) {
  try {
    const results = await db.select().from(typeTable).where(eq(typeTable.name, name)).limit(1);
    return results[0] || null;
  } catch {
    return null;
  }
}
