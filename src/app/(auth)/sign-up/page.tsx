import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up | ComicWise",
  description: "Create a new ComicWise account",
};

/**
 * Sign Up Page Component
 */
export default async function SignUpPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join ComicWise today and start reading</p>
        </div>

        <SignUpForm />

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="text-blue-500 hover:text-blue-400" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
