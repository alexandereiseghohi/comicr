import { describe, expect, it, vi } from "vitest";

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
  const chain = {
    limit: async () => mockChapters,
    where: () => ({ limit: async () => mockChapters }),
    from: () => ({ where: () => ({ limit: async () => mockChapters }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockChapters }) }) }),
  } as any;
  return { db: chain };
});

import { getChapterById, getChaptersByComicId } from "@/database/queries/chapter.queries";

describe("chapter queries", () => {
  it("getChaptersByComicId returns list", async () => {
    const res = await getChaptersByComicId(1);
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect((res.data as any)[0].chapterNumber).toBe(1);
  });

  it("getChapterById returns one", async () => {
    const res = await getChapterById(1);
    expect(res.success).toBe(true);
    expect((res.data as any).id).toBe(1);
  });
});
