import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 1, userId: "u1", comicId: 1, chapterId: 1, pageNumber: 1 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getProgressByUser } from "@/database/queries/readingProgress.queries";

describe("readingProgress queries", () => {
  it("getProgressByUser returns progress rows", async () => {
    const res = await getProgressByUser("u1");
    expect(res.success).toBe(true);
    expect((res.data as any)[0].userId).toBe("u1");
  });
});
