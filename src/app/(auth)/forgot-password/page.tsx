/**
 * Forgot Password Page
 * @description Password reset request page
 */

import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { auth } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Forgot Password | ComicWise",
  description: "Reset your ComicWise password",
};

/**
 * Forgot Password Page Component
 */
export default async function ForgotPasswordPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-slate-400">
          Remember your password?{" "}
          <a className="text-blue-500 hover:text-blue-400" href="/auth/sign-in">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
