import { db } from "@/database/db";
import { genre } from "@/database/schema";
import type { CreateGenreInput, UpdateGenreInput } from "@/schemas/genre-schema";
import { eq, inArray } from "drizzle-orm";

export async function createGenre(data: CreateGenreInput) {
  try {
    const result = await db.insert(genre).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function updateGenre(id: number, data: UpdateGenreInput) {
  try {
    const result = await db.update(genre).set(data).where(eq(genre.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function deleteGenre(id: number) {
  try {
    await db.delete(genre).where(eq(genre.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}

export async function setGenreActive(id: number, isActive: boolean) {
  try {
    const result = await db.update(genre).set({ isActive }).where(eq(genre.id, id)).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function bulkSetGenresActive(ids: number[], isActive: boolean) {
  try {
    await db.update(genre).set({ isActive }).where(inArray(genre.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Bulk update failed" };
  }
}
