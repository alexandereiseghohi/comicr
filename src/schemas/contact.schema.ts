import { z } from "zod";

/**
 * Schema for contact form validation
 * Enforces email format, name length, and message constraints
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;
