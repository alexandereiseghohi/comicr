/**
 * Forgot Password Page
 * @description Password reset request page
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Forgot Password | ComicWise',
  description: 'Reset your ComicWise password',
};

/**
 * Forgot Password Page Component
 */
export default async function ForgotPasswordPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-slate-400 text-sm mt-6">
          Remember your password?{' '}
          <a href="/auth/sign-in" className="text-blue-500 hover:text-blue-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
