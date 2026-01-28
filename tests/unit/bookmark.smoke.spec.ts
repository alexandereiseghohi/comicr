import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ userId: "user1", comicId: 1 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getBookmarksByUser } from "@/database/queries/bookmark.queries";

describe("bookmark queries", () => {
  it("getBookmarksByUser returns bookmarks", async () => {
    const res = await getBookmarksByUser("user1");
    expect(res.success).toBe(true);
    expect((res.data as any)[0].comicId).toBe(1);
  });
});
