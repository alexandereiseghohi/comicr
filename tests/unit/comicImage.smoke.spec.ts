import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 1, comicId: 1, imageUrl: "/img/1.jpg", imageOrder: 1 }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getImagesByComicId } from "@/database/queries/comic-image.queries";

describe("comicImage queries", () => {
  it("getImagesByComicId returns images", async () => {
    const res = await getImagesByComicId(1);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    expect((res.data as any)[0].imageUrl).toBe("/img/1.jpg");
  });
});
