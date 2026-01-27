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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-slate-400 mb-4">
              We&apos;ve sent you an email with a link to verify your account. Please check your
              inbox and click the link to continue.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
            <p className="text-slate-300 text-sm">
              <strong>Didn&apos;t receive an email?</strong> Check your spam folder or try signing up
              again.
            </p>
          </div>

          <a
            href="/auth/sign-in"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
