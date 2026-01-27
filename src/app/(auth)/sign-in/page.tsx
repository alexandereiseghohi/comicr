/**
 * Sign In Page
 * @description User login page with email/password and OAuth options
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata = {
  title: 'Sign In | ComicWise',
  description: 'Sign in to your ComicWise account',
};

/**
 * Sign In Page Component
 */
export default async function SignInPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect('/');
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
          Don't have an account?{' '}
          <a href="/auth/sign-up" className="text-blue-500 hover:text-blue-400">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
