import { describe, expect, it, vi } from "vitest";

import { createMockChain } from "./mock-db";

vi.mock("@/database/db", () => {
  const mockResult = [{ userId: "user1", comicId: 1 }];
  const chain = createMockChain(mockResult);
  return { db: chain };
});

import { getBookmarksByUser } from "@/database/queries/bookmark.queries";

type Bookmark = { comicId: number; userId: string; };

describe("bookmark queries", () => {
  it("getBookmarksByUser returns bookmarks", async () => {
    const res = await getBookmarksByUser("user1");
    expect(res.success).toBe(true);
    const data = res.data as unknown as Bookmark[];
    expect(data[0].comicId).toBe(1);
  });
});
