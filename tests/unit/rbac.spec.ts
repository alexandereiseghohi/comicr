/**
 * RBAC (Role-Based Access Control) Tests
 * Tests authorization guards across admin-only server actions
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// Reset all mocks before each test
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("RBAC Authorization", () => {
  describe("Genre Actions - Admin Guard", () => {
    it("rejects unauthenticated users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => null),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test Genre" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
      expect(result.error).toContain("Admin");
    });

    it("rejects regular users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123", role: "user", name: "Regular User" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test Genre" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
    });

    it("rejects moderators (admin-only action)", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "mod-123", role: "moderator", name: "Moderator" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test Genre" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
    });

    it("allows admin users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "admin-123", role: "admin", name: "Admin User" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(async () => null),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({
        createGenre: vi.fn(async (data: unknown) => ({
          success: true,
          data: { id: 1, ...(data as Record<string, unknown>) },
          error: undefined,
        })),
      }));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test Genre" });
      expect(result.success).toBe(true);
    });
  });

  describe("Type Actions - Admin Guard", () => {
    it("rejects unauthenticated users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => null),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/type.queries", () => ({
        getTypeByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/type.mutations", () => ({}));

      const { createTypeAction } = await import("@/lib/actions/type.actions");
      const result = await createTypeAction({ name: "Test Type" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
      expect(result.error).toContain("Admin");
    });

    it("allows admin users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "admin-123", role: "admin", name: "Admin" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/type.queries", () => ({
        getTypeByName: vi.fn(async () => null),
      }));
      vi.doMock("@/database/mutations/type.mutations", () => ({
        createType: vi.fn(async (data: unknown) => ({
          success: true,
          data: { id: 1, ...(data as Record<string, unknown>) },
          error: undefined,
        })),
      }));
      const { createTypeAction } = await import("@/lib/actions/type.actions");
      const result = await createTypeAction({ name: "Test Type" });
      expect(result.success).toBe(true);
    });
  });

  describe("Author Actions - Admin Guard", () => {
    it("rejects regular users for create", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123", role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/author.queries", () => ({}));
      vi.doMock("@/database/mutations/author.mutations", () => ({}));

      const { createAuthorAction } = await import("@/lib/actions/author.actions");
      const result = await createAuthorAction({ name: "Test Author" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain("UNAUTHORIZED");
      }
    });
  });

  describe("Artist Actions - Admin Guard", () => {
    it("rejects regular users for create", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123", role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/artist.queries", () => ({}));
      vi.doMock("@/database/mutations/artist.mutations", () => ({}));

      const { createArtistAction } = await import("@/lib/actions/artist.actions");
      const result = await createArtistAction({ name: "Test Artist" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain("UNAUTHORIZED");
      }
    });
  });

  describe("Bulk Operations - Admin Guard", () => {
    it("rejects bulk delete for non-admin", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123", role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { bulkDeleteGenresAction } = await import("@/lib/actions/genre.actions");
      const result = await bulkDeleteGenresAction([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain("UNAUTHORIZED");
      }
    });

    it("rejects bulk restore for non-admin", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123", role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { bulkRestoreGenresAction } = await import("@/lib/actions/genre.actions");
      const result = await bulkRestoreGenresAction([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain("UNAUTHORIZED");
      }
    });
  });

  describe("Session Edge Cases", () => {
    it("rejects when session exists but user object is missing", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({ user: undefined })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
    });

    it("rejects when user has no id", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { role: "admin" }, // No id
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
    });

    it("rejects when user has no role", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: "user-123" }, // No role
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/lib/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("UNAUTHORIZED");
    });
  });
});
