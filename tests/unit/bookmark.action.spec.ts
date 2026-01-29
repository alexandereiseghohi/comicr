import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/mutations/bookmark.mutations", () => ({
  addBookmark: vi.fn(async (data: unknown) => ({
    success: true,
    data: { ...(data as Record<string, unknown>), createdAt: new Date().toISOString() },
  })),
  removeBookmark: vi.fn(async () => ({ success: true })),
}));

import { addBookmarkAction, removeBookmarkAction } from "@/lib/actions/bookmark.action";

describe("bookmark actions", () => {
  it("rejects invalid add input", async () => {
    const res = await addBookmarkAction({});
    expect(res.ok).toBe(false);
    expect(res).toHaveProperty("error");
  });

  it("accepts valid add input", async () => {
    const res = await addBookmarkAction({ userId: "u1", comicId: 1 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      const data = res.data as unknown as { comicId: number };
      expect(data.comicId).toBe(1);
    }
  });

  it("rejects invalid remove input", async () => {
    const res = await removeBookmarkAction({});
    expect(res.ok).toBe(false);
  });

  it("accepts valid remove input", async () => {
    const res = await removeBookmarkAction({ userId: "u1", comicId: 1 });
    expect(res.ok).toBe(true);
  });
});
