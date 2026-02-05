import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  // Import inside factory to avoid hoisting issues
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { userId: "user1", comicId: 1 };
    const chain = createSimpleMockChain({ success: true, data: [mockResult] });
    return { db: chain };
  })();
});

import { getBookmarksByUser } from "@/database/queries/bookmark.queries";

type Bookmark = { comicId: number; userId: string };

describe("bookmark queries", () => {
  it("getBookmarksByUser returns bookmarks", async () => {
    const res = await getBookmarksByUser("user1");
    expect(res.success).toBe(true);
    const data = res.data as unknown as Bookmark[];
    expect(data[0].comicId).toBe(1);
  });
});
