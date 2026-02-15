const UNAUTHORIZED = "UNAUTHORIZED";
const ADMIN = "Admin";
const TEST_GENRE = "Test Genre";
const TEST_TYPE = "Test Type";
const TEST_AUTHOR = "Test Author";
const TEST_ARTIST = "Test Artist";
const USER_ID = "user-123";
const ADMIN_ID = "admin-123";
const MOD_ID = "mod-123";
const REGULAR_USER_NAME = "Regular User";
const MODERATOR_NAME = "Moderator";
const ADMIN_USER_NAME = "Admin User";
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

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: TEST_GENRE });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
      expect(result.error).toContain(ADMIN);
    });

    it("rejects regular users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: USER_ID, role: "user", name: REGULAR_USER_NAME },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: TEST_GENRE });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
    });

    it("rejects moderators (admin-only action)", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: MOD_ID, role: "moderator", name: MODERATOR_NAME },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({
        getGenreByName: vi.fn(),
      }));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: TEST_GENRE });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
    });

    it("allows admin users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: ADMIN_ID, role: "admin", name: ADMIN_USER_NAME },
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

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: TEST_GENRE });
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

      const { createTypeAction } = await import("@/actions/type.actions");
      const result = await createTypeAction({ name: TEST_TYPE });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
      expect(result.error).toContain(ADMIN);
    });

    it("allows admin users", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: ADMIN_ID, role: "admin", name: "Admin" },
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
      const { createTypeAction } = await import("@/actions/type.actions");
      const result = await createTypeAction({ name: TEST_TYPE });
      expect(result.success).toBe(true);
    });
  });

  describe("Author Actions - Admin Guard", () => {
    it("rejects regular users for create", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: USER_ID, role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/author.queries", () => ({}));
      vi.doMock("@/database/mutations/author.mutations", () => ({}));

      const { createAuthorAction } = await import("@/actions/author.actions");
      const result = await createAuthorAction({ name: TEST_AUTHOR });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : typeof result.error === "object" && result.error !== null && "message" in result.error
              ? String(result.error.message)
              : "";
        expect([errorMsg.includes(UNAUTHORIZED), errorMsg.includes("Admin access required")].some(Boolean)).toBe(true);
      }
    });
  });

  describe("Artist Actions - Admin Guard", () => {
    it("rejects regular users for create", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: USER_ID, role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/artist.queries", () => ({}));
      vi.doMock("@/database/mutations/artist.mutations", () => ({}));

      const { createArtistAction } = await import("@/actions/artist.actions");
      const result = await createArtistAction({ name: TEST_ARTIST });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : typeof result.error === "object" && result.error !== null && "message" in result.error
              ? String(result.error.message)
              : "";
        expect([errorMsg.includes(UNAUTHORIZED), errorMsg.includes("Admin access required")].some(Boolean)).toBe(true);
      }
    });
  });

  describe("Bulk Operations - Admin Guard", () => {
    it("rejects bulk delete for non-admin", async () => {
      vi.doMock("@/auth", () => ({
        auth: vi.fn(async () => ({
          user: { id: USER_ID, role: "user" },
        })),
      }));
      vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
      vi.doMock("@/database/queries/genre.queries", () => ({}));
      vi.doMock("@/database/mutations/genre.mutations", () => ({}));

      const { bulkDeleteGenresAction } = await import("@/actions/genre.actions");
      const result = await bulkDeleteGenresAction([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain(UNAUTHORIZED);
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

      const { bulkRestoreGenresAction } = await import("@/actions/genre.actions");
      const result = await bulkRestoreGenresAction([1, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
        expect(result.error).toContain(UNAUTHORIZED);
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

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
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

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
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

      const { createGenreAction } = await import("@/actions/genre.actions");
      const result = await createGenreAction({ name: "Test" });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain(UNAUTHORIZED);
    });
  });
});
