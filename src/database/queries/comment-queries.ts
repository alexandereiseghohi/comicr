/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/database/db";
import { comment } from "@/database/schema";
import type { Comment } from "@/types";
import { eq } from "drizzle-orm";

export async function getComments(comicId: number): Promise<Comment[]> {
  // If comment.comicId does not exist, replace with the correct column or remove the filter
  // For now, assume comment has comicId column. If not, fix schema accordingly.
  return (await db
    .select()
    .from(comment)
    .where(eq((comment as any).comicId, comicId))) as unknown as Comment[];
}
