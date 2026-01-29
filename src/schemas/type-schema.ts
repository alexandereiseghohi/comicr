import { z } from "zod";

export const createTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateTypeSchema = createTypeSchema.partial();

export type CreateTypeInput = z.infer<typeof createTypeSchema>;
export type UpdateTypeInput = z.infer<typeof updateTypeSchema>;
