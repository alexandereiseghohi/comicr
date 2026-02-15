import { describe, expect, it, vi } from "vitest";

import { getBookmarksByUser } from "@/database/queries/bookmark.queries";
vi.mock("@/database/db", () => {
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { userId: "user1", comicId: 1 };
    const chain = createSimpleMockChain(mockResult);
    return { db: chain };
  })();
});
type Bookmark = { comicId: number; userId: string };

describe("bookmark queries", () => {
  it("getBookmarksByUser returns bookmarks", async () => {
    const res = await getBookmarksByUser("user1");
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data && (res.data[0] as Bookmark);
    expect(data?.comicId).toBe(1);
  });
});
