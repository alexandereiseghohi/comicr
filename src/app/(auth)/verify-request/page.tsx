/**
 * Verify Request Page
 * @description Email verification confirmation page
 */

export const metadata = {
  title: 'Check Your Email | ComicWise',
  description: 'Verify your email address',
};

/**
 * Verify Request Page Component
 * Shown after user requests email verification
 */
export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <h1 className="mb-2 text-4xl font-bold text-white">Check Your Email</h1>
            <p className="mb-4 text-slate-400">
              We&apos;ve sent you an email with a link to verify your account. Please check your
              inbox and click the link to continue.
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-4">
            <p className="text-sm text-slate-300">
              <strong>Didn&apos;t receive an email?</strong> Check your spam folder or try signing up
              again.
            </p>
          </div>

          <a
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            href="/auth/sign-in"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
