/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ comicId: 1, genreId: 2 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getGenresByComicId } from "@/database/queries/comic-to-genre.queries";

describe("comicToGenre queries", () => {
  it("getGenresByComicId returns relations", async () => {
    const res = await getGenresByComicId(1);
    expect(res.success).toBe(true);
    expect((res.data as any)[0].genreId).toBe(2);
  });
});
