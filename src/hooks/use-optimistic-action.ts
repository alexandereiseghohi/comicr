import { useState } from "react";

("use client");
type ActionFn<T = unknown, R = unknown> = (payload: T) => Promise<R>;

/**
 * A tiny optimistic action helper.
 * - applyOptimistic: updates local state immediately
 * - action: async function to confirm server change
 */
export function useOptimisticAction<T, R>(action: ActionFn<T, R>) {
  const [loading, setLoading] = useState(false);

  async function run(payload: T, applyOptimistic?: () => void, rollback?: () => void) {
    if (applyOptimistic) applyOptimistic();
    setLoading(true);
    try {
      const res = await action(payload);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      if (rollback) rollback();
      throw err;
    }
  }

  return { run, loading } as const;
}
