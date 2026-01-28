import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 1, content: "Hi", userId: "u1", chapterId: 1 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getCommentsByChapterId } from "@/database/queries/comment.queries";

describe("comment queries", () => {
  it("getCommentsByChapterId returns comments", async () => {
    const res = await getCommentsByChapterId(1);
    expect(res.success).toBe(true);
    expect((res.data as any)[0].content).toBe("Hi");
  });
});
