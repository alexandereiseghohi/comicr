import { describe, expect, it, vi } from "vitest";

import { getGenresByComicId } from "@/database/queries/comic-to-genre.queries";
vi.mock("@/database/db", () => {
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { comicId: 1, genreId: 2 };
    const chain = createSimpleMockChain(mockResult);
    return { db: chain };
  })();
});
type MockComicToGenre = { comicId: number; genreId: number };

describe("comicToGenre queries", () => {
  it("getGenresByComicId returns relations", async () => {
    const res = await getGenresByComicId(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data && (res.data[0] as MockComicToGenre);
    expect(data?.genreId).toBe(2);
  });
});
