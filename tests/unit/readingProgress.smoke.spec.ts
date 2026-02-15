import { describe, expect, it, vi } from "vitest";

import { getProgressByUser } from "@/database/queries/reading-progress.queries";
vi.mock("@/database/db", () => {
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { id: 1, userId: "u1", comicId: 1, chapterId: 1, pageNumber: 1 };
    const chain = createSimpleMockChain(mockResult);
    return { db: chain };
  })();
});
type MockReadingProgress = { chapterId: number; comicId: number; id: number; pageNumber: number; userId: string };

describe("readingProgress queries", () => {
  it("getProgressByUser returns progress rows", async () => {
    const res = await getProgressByUser("u1");
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data && (res.data[0] as MockReadingProgress);
    expect(data?.userId).toBe("u1");
  });
});
