/**
 * Auth Loading State
 * @description Loading skeleton for authentication pages
 */
export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto h-8 w-48 rounded bg-slate-800" />
          <div className="mx-auto h-4 w-64 rounded bg-slate-800" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-slate-700" />
            <div className="h-10 w-full rounded bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-700" />
            <div className="h-10 w-full rounded bg-slate-700" />
          </div>
          <div className="h-10 w-full rounded bg-slate-700" />
        </div>

        {/* Footer skeleton */}
        <div className="mt-6 flex justify-center">
          <div className="h-4 w-48 rounded bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
