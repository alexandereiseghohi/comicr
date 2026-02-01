import { z } from "zod";

export const createAuthorSchema = z.object({
  name: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
