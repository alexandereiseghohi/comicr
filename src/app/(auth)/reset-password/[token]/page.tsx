import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | ComicWise",
  description: "Set your new password",
};

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

/**
 * Reset Password Page Component
 */
export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;

  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">New Password</h1>
          <p className="text-slate-400">Enter your new password below</p>
        </div>

        <ResetPasswordForm token={token} />

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link className="text-blue-500 hover:text-blue-400" href="/sign-in">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
