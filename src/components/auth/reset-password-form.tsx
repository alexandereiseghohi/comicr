"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { resetPasswordServerAction } from "@/app/(auth)/reset-password/[token]/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordValidator } from "@/types/validation";

/**
 * Reset Password Form Component
 * @description Form for setting a new password after reset request
 */

interface ResetPasswordFormProps {
  token: string;
}

/**
 * Reset Password Form Schema
 */
const resetPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string().min(1, "Password confirmation required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Reset Password Form Component
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending] = useTransition();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  /**
   * Handle form submission
   */

  // Handler for server action result
  async function handleServerAction(formData: FormData) {
    const result = await resetPasswordServerAction(formData);
    if (!result.ok) {
      toast.error(result.error || "Failed to reset password");
      return;
    }
    toast.success("Password updated successfully");
    router.push("/sign-in");
  }

  return (
    <Form {...form}>
      <form action={handleServerAction} className="space-y-4">
        <input name="token" type="hidden" value={token} />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">New Password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  className="border-slate-700 bg-slate-800 text-white"
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <p className="mt-1 text-xs text-slate-400">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Confirm Password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  className="border-slate-700 bg-slate-800 text-white"
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending} type="submit">
          {isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
