import { BookmarkSchema, CreateBookmarkSchema } from "@/schemas/bookmark.schema";
import { describe, expect, it } from "vitest";

describe("bookmark schema", () => {
  it("parses valid bookmark", () => {
    const parsed = BookmarkSchema.safeParse({ userId: "u1", comicId: 1 });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid bookmark", () => {
    const parsed = BookmarkSchema.safeParse({ userId: 1, comicId: "x" });
    expect(parsed.success).toBe(false);
  });

  it("create schema accepts minimal input", () => {
    const parsed = CreateBookmarkSchema.safeParse({ userId: "u1", comicId: 2 });
    expect(parsed.success).toBe(true);
  });
});
