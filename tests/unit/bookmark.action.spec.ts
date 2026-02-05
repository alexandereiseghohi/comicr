import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/mutations/bookmark.mutations", () => ({
  addBookmark: vi.fn(async (data: unknown) => ({
    success: true,
    data: {
      ...(data as Record<string, unknown>),
      createdAt: new Date().toISOString(),
    },
    error: undefined,
  })),
  removeBookmark: vi.fn(async () => ({
    success: true,
    error: undefined,
    data: null,
  })),
}));

import { addBookmarkAction, removeBookmarkAction } from "@/lib/actions/bookmark.actions";

describe("bookmark actions", () => {
  it("rejects invalid add input", async () => {
    const res = await addBookmarkAction({});
    expect(res.success).toBe(false);
    expect(res).toHaveProperty("error");
  });

  it("accepts valid add input", async () => {
    const res = await addBookmarkAction({ userId: "u1", comicId: 1 });
    expect(res.success).toBe(true);
    if (res.success) {
      const data = res.data as unknown as { comicId: number };
      expect(data.comicId).toBe(1);
    }
  });

  it("rejects invalid remove input", async () => {
    const res = await removeBookmarkAction({});
    expect(res.success).toBe(false);
  });

  it("accepts valid remove input", async () => {
    const res = await removeBookmarkAction({ userId: "u1", comicId: 1 });
    expect(res.success).toBe(true);
  });
});
