"use client";
import Link from "next/link";
import { useEffect } from "react";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Auth Error Boundary
 * @description Error handling for authentication pages
 */
export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Authentication Error</h2>
          <p className="mb-4 text-slate-400">We encountered an error. Please try again or return to the home page.</p>
          <div className="flex justify-center gap-4">
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              onClick={reset}
            >
              Try again
            </button>
            <Link
              className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition hover:border-slate-500"
              href="/"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
