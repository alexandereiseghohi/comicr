import { vi } from "vitest";

export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();
export const unstable_cache = vi.fn(<T extends (...args: unknown[]) => unknown>(fn: T) => fn);
