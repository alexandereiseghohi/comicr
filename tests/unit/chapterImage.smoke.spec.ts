import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 1, chapterId: 1, imageUrl: "/img/page1.jpg", pageNumber: 1 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getImagesByChapterId } from "@/database/queries/chapterImage.queries";

describe("chapterImage queries", () => {
  it("getImagesByChapterId returns images", async () => {
    const res = await getImagesByChapterId(1);
    expect(res.success).toBe(true);
    expect((res.data as any)[0].pageNumber).toBe(1);
  });
});
