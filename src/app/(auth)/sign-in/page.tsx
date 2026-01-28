/**
 * Sign In Page
 * @description User login page with email/password and OAuth options
 */

import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/lib/auth-config";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your ComicWise account</p>
        </div>

        <SignInForm />

        <p className="text-center text-slate-400 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
