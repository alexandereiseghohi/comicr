import { z } from "zod";

import { emailValidator, passwordValidator } from "@/types/validation";

/**
 * Sign up schema - uses same password validation as client
 * Requires: 8+ chars, uppercase, lowercase, number, special character
 */
export const SignUpSchema = z.object({
  email: emailValidator,
  name: z.string().min(1).max(255).optional(),
  password: passwordValidator,
});

/**
 * Sign in schema - minimal validation, actual check done in credentials provider
 */
export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: emailValidator,
});

/**
 * Password reset schema - for setting new password with token
 */
export const PasswordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordValidator,
    confirmPassword: z.string().min(1, "Password confirmation required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
