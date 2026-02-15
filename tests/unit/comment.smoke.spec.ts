import { describe, expect, it, vi } from "vitest";

import { getCommentsByChapterId } from "@/database/queries/comment.queries";
vi.mock("@/database/db", () => {
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { id: 1, content: "Hi", userId: "u1", chapterId: 1 };
    const chain = createSimpleMockChain(mockResult);
    return { db: chain };
  })();
});
type MockComment = { chapterId: number; content: string; id: number; userId: string };

describe("comment queries", () => {
  it("getCommentsByChapterId returns comments", async () => {
    const res = await getCommentsByChapterId(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data && (res.data[0] as MockComment);
    expect(data?.content).toBe("Hi");
  });
});
