import { describe, expect, it, vi } from "vitest";

vi.mock("@/database/db", () => {
  const mockResult = [{ id: 2, name: "Mock Author", bio: "bio", image: null }];
  const chain = {
    limit: async () => mockResult,
    where: () => ({ limit: async () => mockResult }),
    from: () => ({ where: () => ({ limit: async () => mockResult }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: async () => mockResult }) }) }),
  } as any;
  return { db: chain };
});

import { getAuthorById } from "@/database/queries/author.queries";

describe("author queries", () => {
  it("getAuthorById returns author row", async () => {
    const res = await getAuthorById(2);
    expect(res.success).toBe(true);
    expect(res.data).toBeTruthy();
    expect((res.data as any).id).toBe(2);
    expect((res.data as any).name).toBe("Mock Author");
  });
});
