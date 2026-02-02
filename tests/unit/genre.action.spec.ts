import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: "admin-user", role: "admin", name: "Admin User" },
  })),
}));

// Mock the queries
vi.mock("@/database/queries/genre.queries", () => ({
  getGenreByName: vi.fn(async () => null), // No existing genre by default
}));

// Mock the mutations
vi.mock("@/database/mutations/genre.mutations", () => ({
  createGenre: vi.fn(async (data: unknown) => ({
    ok: true,
    data: {
      id: 1,
      ...(data as Record<string, unknown>),
      createdAt: new Date(),
    },
  })),
  updateGenre: vi.fn(async (id: number, data: unknown) => ({
    ok: true,
    data: { id, ...(data as Record<string, unknown>) },
  })),
  deleteGenre: vi.fn(async () => ({ ok: true })),
  setGenreActive: vi.fn(async () => ({ ok: true })),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  bulkDeleteGenresAction,
  bulkRestoreGenresAction,
  createGenreAction,
  deleteGenreAction,
  restoreGenreAction,
  updateGenreAction,
} from "@/lib/actions/genre.actions";

describe("genre actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createGenreAction", () => {
    it("rejects invalid input - empty name", async () => {
      const res = await createGenreAction({ name: "" });
      expect(res.ok).toBe(false);
      expect(res).toHaveProperty("error");
    });

    it("accepts valid input with name only", async () => {
      const res = await createGenreAction({ name: "Action" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("id");
        expect(res.data).toHaveProperty("name", "Action");
      }
    });

    it("accepts valid input with all fields", async () => {
      const res = await createGenreAction({
        name: "Fantasy",
        slug: "fantasy",
        description: "Fantasy comics with magic",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("slug", "fantasy");
        expect(res.data).toHaveProperty("description", "Fantasy comics with magic");
      }
    });
  });

  describe("updateGenreAction", () => {
    // Note: updateGenreAction doesn't validate id > 0, it just processes
    it("accepts id=0 (no validation)", async () => {
      const res = await updateGenreAction(0, { name: "Updated" });
      expect(res.ok).toBe(true);
    });

    it("accepts valid update", async () => {
      const res = await updateGenreAction(1, { name: "Updated Genre" });
      expect(res.ok).toBe(true);
    });

    it("accepts partial update with isActive", async () => {
      const res = await updateGenreAction(1, { isActive: false });
      expect(res.ok).toBe(true);
    });
  });

  describe("deleteGenreAction", () => {
    // Note: deleteGenreAction doesn't validate id > 0
    it("accepts id=0 (soft delete processes any id)", async () => {
      const res = await deleteGenreAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await deleteGenreAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("restoreGenreAction", () => {
    // Note: restoreGenreAction doesn't validate id > 0
    it("accepts id=0 (restore processes any id)", async () => {
      const res = await restoreGenreAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await restoreGenreAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkDeleteGenresAction", () => {
    // Note: bulkDeleteGenresAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkDeleteGenresAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkDeleteGenresAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkRestoreGenresAction", () => {
    // Note: bulkRestoreGenresAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkRestoreGenresAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkRestoreGenresAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });
});
