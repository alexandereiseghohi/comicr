import { db } from "@/database/db";
import { author } from "@/database/schema";
import type { CreateAuthorInput, UpdateAuthorInput } from "@/schemas/author-schema";
import { eq } from "drizzle-orm";

export async function createAuthor(data: CreateAuthorInput) {
  try {
    const result = await db.insert(author).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function updateAuthor(id: number, data: UpdateAuthorInput) {
  try {
    const result = await db.update(author).set(data).where(eq(author.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function deleteAuthor(id: number) {
  try {
    await db.delete(author).where(eq(author.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
