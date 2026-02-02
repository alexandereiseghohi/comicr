"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { forgotPasswordServerAction } from "@/app/(auth)/forgot-password/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { emailValidator } from "@/types/validation";

/**
 * Forgot Password Form Component
 * @description Form for requesting password reset
 */

/**
 * Forgot Password Form Schema
 */
const forgotPasswordSchema = z.object({
  email: emailValidator,
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Form Component
 */
export function ForgotPasswordForm() {
  const [isPending] = useTransition();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Handle form submission
   */

  // Handler for server action result
  async function handleServerAction(formData: FormData) {
    const result = await forgotPasswordServerAction(formData);
    if (!result.ok) {
      toast.error(result.error || "Failed to send reset email");
      return;
    }
    toast.success("If an account exists with that email, you will receive reset instructions");
    form.reset();
  }

  return (
    <Form {...form}>
      <form action={handleServerAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-200">Email Address</FormLabel>
              <FormControl>
                <Input
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  className="border-slate-700 bg-slate-800 text-white"
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending} type="submit">
          {isPending ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );
}
