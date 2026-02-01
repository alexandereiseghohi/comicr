import { z } from "zod";

/**
 * Comment Schema
 * Validates comments with threading support (parentId for replies)
 */
export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  chapterId: z.number().int().positive(),
  parentId: z.number().int().positive().optional().nullable(),
});

export const editCommentSchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1).max(2000),
});

export const deleteCommentSchema = z.object({
  id: z.number().int().positive(),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
