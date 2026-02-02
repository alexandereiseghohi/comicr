/**
 * Sign In Page
 * @description User login page with email/password and OAuth options
 */

import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Sign In | ComicWise",
  description: "Sign in to your ComicWise account",
};

/**
 * Sign In Page Component
 */
export default async function SignInPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your ComicWise account</p>
        </div>

        <SignInForm />

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link className="text-blue-500 hover:text-blue-400" href="/sign-up">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
