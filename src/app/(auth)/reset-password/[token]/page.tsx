/**
 * Reset Password Page
 * @description Password reset confirmation page
 */

import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Reset Password | ComicWise',
  description: 'Set your new password',
};

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

/**
 * Reset Password Page Component
 */
export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  if (!token) {
    redirect('/auth/forgot-password');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">New Password</h1>
          <p className="text-slate-400">Enter your new password below</p>
        </div>

        <ResetPasswordForm token={token} />

        <p className="text-center text-slate-400 text-sm mt-6">
          <a href="/auth/sign-in" className="text-blue-500 hover:text-blue-400">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
