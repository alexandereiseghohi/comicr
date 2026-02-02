"use server";
import { z } from "zod";

import { signUpAction } from "@/lib/actions/auth.actions";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
});

export async function signUpServerAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const parsed = signUpSchema.safeParse({ email, password, confirmPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords must match" };
  }
  return await signUpAction({
    email: email as string,
    password: password as string,
  });
}
