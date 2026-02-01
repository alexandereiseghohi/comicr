import { db } from "@/database/db";
import { comicImage } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function createComicImage(data: {
  comicId: number;
  imageUrl: string;
  imageOrder: number;
}) {
  try {
    const result = await db.insert(comicImage).values(data).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Creation failed" };
  }
}

export async function deleteComicImage(id: number) {
  try {
    await db.delete(comicImage).where(eq(comicImage.id, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Deletion failed" };
  }
}
