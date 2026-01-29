import { describe, expect, it, vi } from "vitest";
import { createMockChain } from "./mock-db";

vi.mock("@/database/db", () => {
  const mockChapters = [
    {
      id: 1,
      title: "Ch 1",
      chapterNumber: 1,
      releaseDate: new Date().toISOString(),
      comicId: 1,
      content: "c1",
    },
    {
      id: 2,
      title: "Ch 2",
      chapterNumber: 2,
      releaseDate: new Date().toISOString(),
      comicId: 1,
      content: "c2",
    },
  ];
  const chain = createMockChain(mockChapters);
  return { db: chain };
});

import { getChapterById, getChaptersByComicId } from "@/database/queries/chapter.queries";

type Chapter = {
  id: number;
  title: string;
  chapterNumber: number;
  releaseDate: string;
  comicId: number;
  content: string;
};

describe("chapter queries", () => {
  it("getChaptersByComicId returns list", async () => {
    const res = await getChaptersByComicId(1);
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    const data = res.data as unknown as Chapter[];
    expect(data[0].chapterNumber).toBe(1);
  });

  it("getChapterById returns one", async () => {
    const res = await getChapterById(1);
    expect(res.success).toBe(true);
    const data = res.data as unknown as Chapter;
    expect(data.id).toBe(1);
  });
});
