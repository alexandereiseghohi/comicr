import { db } from "@/database/db";
import { type as typeTable } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getTypes() {
  try {
    const results = await db.select().from(typeTable).orderBy(typeTable.name);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}

export async function getTypeById(id: number) {
  try {
    const results = await db.select().from(typeTable).where(eq(typeTable.id, id)).limit(1);
    return { success: true, data: results[0] || null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Query failed" };
  }
}
