import { z } from "zod";
export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().optional(),
  emailVerified: z.date().optional(),
  role: z.enum(["admin", "moderator", "user"]),
  isActive: z.boolean(),
});
