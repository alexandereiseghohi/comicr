import { describe, expect, it, vi } from "vitest";

// Mock the database module to provide a predictable response chain
vi.mock("@/database/db", () => {
  const mockResult = [
    {
      comic: {
        id: 1,
        title: "Mock Comic",
        slug: "mock-comic",
        coverImage: "/img/mock.jpg",
        description: "A mock comic",
        authorId: 2,
        artistId: 3,
        status: "Ongoing",
        views: 0,
        rating: 0,
        typeId: null,
      },
      author: { id: 2, name: "Mock Author" },
      artist: { id: 3, name: "Mock Artist" },
    },
  ];

  // Provide a chained API that matches drizzle usage in queries
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    leftJoin: () => ({ leftJoin: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
    from: () => ({
      leftJoin: () => ({ leftJoin: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
      where: () => ({ limit: async () => mockResult }),
    }),
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          leftJoin: () => ({ where: () => ({ limit: async () => mockResult }) }),
        }),
        where: () => ({ limit: async () => mockResult }),
      }),
    }),
  } as any;

  return { db: chain };
});

import { getComicBySlug } from "@/database/queries/comic-queries";

describe("comic queries", () => {
  it("getComicBySlug returns comic with author and artist relations", async () => {
    const res = await getComicBySlug("mock-comic");
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    expect((res.data as any).comic).toBeTruthy();
    expect((res.data as any).author).toBeTruthy();
    expect((res.data as any).artist).toBeTruthy();
    expect((res.data as any).author.name).toBe("Mock Author");
  });
});
