"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { signUpServerAction } from "@/app/(auth)/sign-up/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { emailValidator, passwordValidator } from "@/types/validation";

/**
 * Sign Up Form Component
 * @description Registration form with validation and password confirmation
 */

/**
 * Sign up form validation schema
 */
const signUpSchema = z
  .object({
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string().min(1, "Password confirmation required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Sign Up Form Component
 */
export function SignUpForm() {
  const router = useRouter();
  const [isPending] = useTransition();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /**
   * Handle form submission
   */

  // Handler for server action result
  async function handleServerAction(formData: FormData) {
    const result = await signUpServerAction(formData);
    if (!result.ok) {
      toast.error(result.error || "Failed to create account");
      return;
    }
    toast.success("Account created successfully");
    // Auto sign in after registration
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!signInResult?.ok) {
      router.push("/sign-in");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <Form {...form}>
        <form action={handleServerAction} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Email</FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Password</FormLabel>
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

          <div className="flex items-start space-x-2 pt-2">
            <input
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600"
              disabled={isPending}
              id="terms"
              type="checkbox"
            />
            <label className="text-sm text-slate-400" htmlFor="terms">
              I agree to the{" "}
              <a className="text-blue-500 hover:text-blue-400" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-blue-500 hover:text-blue-400" href="#">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending} type="submit">
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
