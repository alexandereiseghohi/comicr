import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  // Import inside factory to avoid hoisting issues
  return (async () => {
    // const { createSimpleMockChain } = await import("./mock-db");
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
    // Return an array for getChaptersByComicId and a single object for getChapterById
    const chain = {
      limit: async (n?: number) => mockChapters.slice(0, n ?? mockChapters.length),
      where: () => chain,
      from: () => chain,
      select: () => chain,
      leftJoin: () => chain,
      rightJoin: () => chain,
      offset: async (n?: number) => mockChapters.slice(n ?? 0),
    };
    return { db: chain };
  })();
});

import { getChapterById, getChaptersByComicId } from "@/database/queries/chapter.queries";

type Chapter = {
  chapterNumber: number;
  comicId: number;
  content: string;
  id: number;
  releaseDate: string;
  title: string;
};

describe("chapter queries", () => {
  it("getChaptersByComicId returns list", async () => {
    const res = await getChaptersByComicId(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    expect(Array.isArray(res.data)).toBe(true);
    const data = res.data as unknown as Chapter[];
    expect(data[0].chapterNumber).toBe(1);
  });

  it("getChapterById returns one", async () => {
    const res = await getChapterById(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data as unknown as Chapter;
    expect(data.id).toBe(1);
  });
});
