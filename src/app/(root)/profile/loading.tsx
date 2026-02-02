/**
 * Profile Loading State
 * @description Loading skeleton for profile routes
 */
export default function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-700" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-slate-700" />
            <div className="h-4 w-60 rounded bg-slate-700" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="h-5 w-32 rounded bg-slate-700" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-slate-700" />
            <div className="h-10 w-full rounded bg-slate-700" />
            <div className="h-10 w-3/4 rounded bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
