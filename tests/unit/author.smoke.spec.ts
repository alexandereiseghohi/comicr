import { describe, expect, it, vi } from "vitest";

import { createMockChain } from "./mock-db";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 2, name: "Mock Author", bio: "bio", image: null }];
  const chain = createMockChain(mockResult);
  return { db: chain };
});

import { getAuthorById } from "@/database/queries/author.queries";

type Author = { bio: null | string; id: number; image: null | string; name: string };

describe("author queries", () => {
  it("getAuthorById returns author row", async () => {
    const res = await getAuthorById(2);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    const data = res.data as unknown as Author;
    expect(data.id).toBe(2);
    expect(data.name).toBe("Mock Author");
  });
});
