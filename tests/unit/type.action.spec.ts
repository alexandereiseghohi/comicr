import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: "admin-user", role: "admin", name: "Admin User" },
  })),
}));

// Mock the queries
vi.mock("@/database/queries/type.queries", () => ({
  getTypeByName: vi.fn(async () => null), // No existing type by default
}));

// Mock the mutations
vi.mock("@/database/mutations/type.mutations", () => ({
  createType: vi.fn(async (data: unknown) => ({
    success: true,
    data: { id: 1, ...(data as Record<string, unknown>), createdAt: new Date() },
  })),
  updateType: vi.fn(async (id: number, data: unknown) => ({
    success: true,
    data: { id, ...(data as Record<string, unknown>) },
  })),
  deleteType: vi.fn(async () => ({ success: true })),
  setTypeActive: vi.fn(async () => ({ success: true })),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  bulkDeleteTypesAction,
  bulkRestoreTypesAction,
  createTypeAction,
  deleteTypeAction,
  restoreTypeAction,
  updateTypeAction,
} from "@/lib/actions/type.actions";

describe("type actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTypeAction", () => {
    it("rejects invalid input - empty name", async () => {
      const res = await createTypeAction({ name: "" });
      expect(res.ok).toBe(false);
      expect(res).toHaveProperty("error");
    });

    it("accepts valid input with name only", async () => {
      const res = await createTypeAction({ name: "Manga" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("id");
        expect(res.data).toHaveProperty("name", "Manga");
      }
    });

    it("accepts valid input with description", async () => {
      const res = await createTypeAction({
        name: "Manhwa",
        description: "Korean web comics",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("description", "Korean web comics");
      }
    });
  });

  describe("updateTypeAction", () => {
    // Note: updateTypeAction doesn't validate id > 0
    it("accepts id=0 (no validation)", async () => {
      const res = await updateTypeAction(0, { name: "Updated" });
      expect(res.ok).toBe(true);
    });

    it("accepts valid update", async () => {
      const res = await updateTypeAction(1, { name: "Updated Type" });
      expect(res.ok).toBe(true);
    });

    it("accepts partial update with isActive", async () => {
      const res = await updateTypeAction(1, { isActive: false });
      expect(res.ok).toBe(true);
    });
  });

  describe("deleteTypeAction", () => {
    // Note: deleteTypeAction doesn't validate id > 0
    it("accepts id=0 (soft delete processes any id)", async () => {
      const res = await deleteTypeAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await deleteTypeAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("restoreTypeAction", () => {
    // Note: restoreTypeAction doesn't validate id > 0
    it("accepts id=0 (restore processes any id)", async () => {
      const res = await restoreTypeAction(0);
      expect(res.ok).toBe(true);
    });

    it("accepts valid id", async () => {
      const res = await restoreTypeAction(1);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkDeleteTypesAction", () => {
    // Note: bulkDeleteTypesAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkDeleteTypesAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkDeleteTypesAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });

  describe("bulkRestoreTypesAction", () => {
    // Note: bulkRestoreTypesAction succeeds with empty array (count: 0)
    it("accepts empty array (processes with count: 0)", async () => {
      const res = await bulkRestoreTypesAction([]);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveProperty("count", 0);
      }
    });

    it("accepts valid ids array", async () => {
      const res = await bulkRestoreTypesAction([1, 2, 3]);
      expect(res.ok).toBe(true);
    });
  });
});
