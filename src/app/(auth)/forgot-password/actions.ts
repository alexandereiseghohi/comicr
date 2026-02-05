"use server";
import { z } from "zod";

import { requestPasswordResetAction } from "@/lib/actions/auth.actions";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function forgotPasswordServerAction(formData: FormData) {
  const email = formData.get("email");
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  return await requestPasswordResetAction(email as string);
}
