/**
 * Sign Up Page
 * @description User registration page
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata = {
  title: 'Sign Up | ComicWise',
  description: 'Create a new ComicWise account',
};

/**
 * Sign Up Page Component
 */
export default async function SignUpPage() {
  // Redirect already authenticated users
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join ComicWise today and start reading</p>
        </div>

        <SignUpForm />

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <a href="/auth/sign-in" className="text-blue-500 hover:text-blue-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
