/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/database/db";
import { comment } from "@/database/schema";
import type { Comment } from "@/types";
import { eq } from "drizzle-orm";

export async function getComments(comicId: number): Promise<Comment[]> {
  return (await db
    .select()
    .from(comment)
    .where(eq((comment as any).comicId, comicId))) as any;
}
