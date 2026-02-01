import { describe, expect, it, vi } from "vitest";
import { createMockChain } from "./mock-db";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 1, chapterId: 1, imageUrl: "/img/page1.jpg", pageNumber: 1 }];
  const chain = createMockChain(mockResult);
  return { db: chain };
});

import { getImagesByChapterId } from "@/database/queries/chapter-image.queries";

type ChapterImage = { id: number; chapterId: number; imageUrl: string; pageNumber: number };

describe("chapterImage queries", () => {
  it("getImagesByChapterId returns images", async () => {
    const res = await getImagesByChapterId(1);
    expect(res.success).toBe(true);
    const data = res.data as unknown as ChapterImage[];
    expect(data[0].pageNumber).toBe(1);
  });
});
