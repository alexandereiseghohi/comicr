import { describe, expect, it, vi } from "vitest";

import { getImagesByComicId } from "@/database/queries/comic-image.queries";
vi.mock("@/database/db", () => {
  return (async () => {
    const { createSimpleMockChain } = await import("./mock-db");
    const mockResult = { id: 1, comicId: 1, imageUrl: "/img/1.jpg", imageOrder: 1 };
    const chain = createSimpleMockChain(mockResult);
    return { db: chain };
  })();
});
type MockComicImage = { comicId: number; id: number; imageOrder: number; imageUrl: string };

describe("comicImage queries", () => {
  it("getImagesByComicId returns images", async () => {
    const res = await getImagesByComicId(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data && (res.data[0] as MockComicImage);
    expect(data?.imageUrl).toBe("/img/1.jpg");
  });
});
