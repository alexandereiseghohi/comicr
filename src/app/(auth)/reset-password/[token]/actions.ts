"use server";
import { z } from "zod";

import { resetPasswordAction } from "@/lib/actions/auth.actions";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export async function resetPasswordServerAction(formData: FormData) {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const token = formData.get("token");
  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword, token });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  return await resetPasswordAction({
    newPassword: password as string,
    confirmPassword: confirmPassword as string,
    token: token as string,
  });
}
