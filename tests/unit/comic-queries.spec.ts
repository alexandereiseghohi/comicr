import { describe, expect, it, vi } from "vitest";

// Mock the database module to provide a predictable response chain
type MockComic = {
  artist: { id: number; name: string };
  author: { id: number; name: string };
  comic: {
    artistId: number;
    authorId: number;
    coverImage: string;
    description: string;
    id: number;
    rating: number;
    slug: string;
    status: string;
    title: string;
    typeId: null | number;
    views: number;
  };
};
const mockResult: MockComic[] = [
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
};
vi.mock("@/database/db", async () => ({ db: chain }));

import { getComicBySlug } from "@/database/queries/comic-queries";

describe("comic queries", () => {
  it("getComicBySlug returns comic with author and artist relations", async () => {
    const res = await getComicBySlug("mock-comic");
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data as unknown as MockComic[];
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].comic).toBeTruthy();
    expect(data[0].author).toBeTruthy();
    expect(data[0].artist).toBeTruthy();
    expect(data[0].author.name).toBe("Mock Author");
  });
});
