import { z } from "zod";

export const ProfileSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().min(1).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
