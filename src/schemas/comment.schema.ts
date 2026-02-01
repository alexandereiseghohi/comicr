import { z } from "zod";

/**
 * Comment Schema
 * Validates comments with threading support (parentId for replies)
 */
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Comment cannot be whitespace only",
    }),
  chapterId: z.number().int().positive(),
  parentId: z.number().int().positive().optional().nullable(),
});

export const editCommentSchema = z.object({
  id: z.number().int().positive(),
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Comment cannot be whitespace only",
    }),
});

export const deleteCommentSchema = z.object({
  id: z.number().int().positive(),
});

export type CommentInput = z.infer<typeof commentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
