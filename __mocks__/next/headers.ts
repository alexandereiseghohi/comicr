import { vi } from "vitest";

export const headers = vi.fn(() => new Map());
export const cookies = vi.fn(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}));
