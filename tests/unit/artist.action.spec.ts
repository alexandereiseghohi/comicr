import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: "admin-user", role: "admin", name: "Admin User" },
  })),
}));

// Mock the queries
vi.mock("@/database/queries/artist.queries", () => ({
  getArtistByName: vi.fn(async () => null), // No existing artist by default
}));

// Mock the mutations
vi.mock("@/database/mutations/artist.mutations", () => ({
  createArtist: vi.fn(async (data: unknown) => ({
    success: true,
    data: { id: 1, ...(data as Record<string, unknown>), createdAt: new Date() },
  })),
  updateArtist: vi.fn(async (id: number, data: unknown) => ({
    success: true,
    data: { id, ...(data as Record<string, unknown>) },
  })),
  deleteArtist: vi.fn(async () => ({ success: true })),
  setArtistActive: vi.fn(async () => ({ success: true })),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  bulkDeleteArtistsAction,
  bulkRestoreArtistsAction,
  createArtistAction,
  deleteArtistAction,
  restoreArtistAction,
  updateArtistAction,
} from "@/lib/actions/artist.actions";

describe("artist actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createArtistAction", () => {
    it("rejects invalid input - empty name", async () => {
      const res = await createArtistAction({ name: "" });
      expect(res.ok).toBe(false);
      expect(res).toHaveProperty("error");
    });

    it("accepts valid input with name only", async () => {
      const res = await createArtistAction({ name: "Artist Name" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("id");
        expect(res.data).toHaveProperty("name", "Artist Name");
      }
    });

    it("accepts valid input with all fields", async () => {
      const res = await createArtistAction({
        name: "Famous Artist",
        bio: "Award-winning illustrator",
        image: "https://example.com/artist.jpg",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("bio", "Award-winning illustrator");
        expect(res.data).toHaveProperty("image", "https://example.com/artist.jpg");
      }
    });
  });

  describe("updateArtistAction", () => {
    // Note: updateArtistAction doesn't validate id > 0
    it("accepts id=0 (no validation)", async () => {
      const res = await updateArtistAction(0, { name: "Updated" });
      expect(res.ok).toBe(true);
    });

    it("accepts valid update", async () => {
      const res = await updateArtistAction(1, { name: "Updated Artist" });
      expect(res.ok).toBe(true);
    });

    it("accepts partial update with isActive", async () => {
      const res = await updateArtistAction(1, { isActive: false });
      expect(res.ok).toBe(true);
    });
  });

  describe("deleteArtistAction", () => {
    // Note: deleteArtistAction doesn't validate id > 0
    it("accepts id=0 (soft delete processes any id)", async () => {
      const res = await deleteArtistAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await deleteArtistAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("restoreArtistAction", () => {
    // Note: restoreArtistAction doesn't validate id > 0
    it("accepts id=0 (restore processes any id)", async () => {
      const res = await restoreArtistAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await restoreArtistAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkDeleteArtistsAction", () => {
    // Note: bulkDeleteArtistsAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkDeleteArtistsAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkDeleteArtistsAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkRestoreArtistsAction", () => {
    // Note: bulkRestoreArtistsAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkRestoreArtistsAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkRestoreArtistsAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });
});
