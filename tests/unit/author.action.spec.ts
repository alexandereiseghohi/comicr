import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: "admin-user", role: "admin", name: "Admin User" },
  })),
}));

// Mock the queries
vi.mock("@/database/queries/author.queries", () => ({
  getAuthorByName: vi.fn(async () => null), // No existing author by default
}));

// Mock the mutations
vi.mock("@/database/mutations/author.mutations", () => ({
  createAuthor: vi.fn(async (data: unknown) => ({
    success: true,
    data: { id: 1, ...(data as Record<string, unknown>), createdAt: new Date() },
  })),
  updateAuthor: vi.fn(async (id: number, data: unknown) => ({
    success: true,
    data: { id, ...(data as Record<string, unknown>) },
  })),
  deleteAuthor: vi.fn(async () => ({ success: true })),
  setAuthorActive: vi.fn(async () => ({ success: true })),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  bulkDeleteAuthorsAction,
  bulkRestoreAuthorsAction,
  createAuthorAction,
  deleteAuthorAction,
  restoreAuthorAction,
  updateAuthorAction,
} from "@/lib/actions/author.actions";

describe("author actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAuthorAction", () => {
    it("rejects invalid input - empty name", async () => {
      const res = await createAuthorAction({ name: "" });
      expect(res.ok).toBe(false);
      expect(res).toHaveProperty("error");
    });

    it("accepts valid input with name only", async () => {
      const res = await createAuthorAction({ name: "John Doe" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("id");
        expect(res.data).toHaveProperty("name", "John Doe");
      }
    });

    it("accepts valid input with all fields", async () => {
      const res = await createAuthorAction({
        name: "Jane Smith",
        bio: "Award-winning author",
        image: "https://example.com/jane.jpg",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("bio", "Award-winning author");
        expect(res.data).toHaveProperty("image", "https://example.com/jane.jpg");
      }
    });
  });

  describe("updateAuthorAction", () => {
    // Note: updateAuthorAction doesn't validate id > 0
    it("accepts id=0 (no validation)", async () => {
      const res = await updateAuthorAction(0, { name: "Updated" });
      expect(res.ok).toBe(true);
    });

    it("accepts valid update", async () => {
      const res = await updateAuthorAction(1, { name: "Updated Author" });
      expect(res.ok).toBe(true);
    });

    it("accepts partial update with isActive", async () => {
      const res = await updateAuthorAction(1, { isActive: false });
      expect(res.ok).toBe(true);
    });
  });

  describe("deleteAuthorAction", () => {
    // Note: deleteAuthorAction doesn't validate id > 0
    it("accepts id=0 (soft delete processes any id)", async () => {
      const res = await deleteAuthorAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await deleteAuthorAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("restoreAuthorAction", () => {
    // Note: restoreAuthorAction doesn't validate id > 0
    it("accepts id=0 (restore processes any id)", async () => {
      const res = await restoreAuthorAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await restoreAuthorAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkDeleteAuthorsAction", () => {
    // Note: bulkDeleteAuthorsAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkDeleteAuthorsAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkDeleteAuthorsAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkRestoreAuthorsAction", () => {
    // Note: bulkRestoreAuthorsAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkRestoreAuthorsAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkRestoreAuthorsAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });
});
