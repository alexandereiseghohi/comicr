/**
 * @file seed.spec.ts
 * @description Tests for seed validation schemas and image helper utilities
 *
 * Note: Tests for seedHelpers functions that require database access are
 * in integration tests. This file focuses on schema validation and
 * imageHelper which don't require database connections.
 */
import { clearDownloadCache, downloadAndSaveImage } from "@/lib/imageHelper";
import {
  ArtistSeedSchema,
  AuthorSeedSchema,
  ChapterSeedSchema,
  ComicSeedSchema,
  GenreSeedSchema,
  SeedConfigSchema,
  TypeSeedSchema,
  UserSeedSchema,
} from "@/lib/validations/seed";
import fs from "fs/promises";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const TEST_DIR = "./test-tmp-seed";

describe("imageHelper", () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    clearDownloadCache();
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it("returns existing file path when file already exists", async () => {
    const file = path.join(TEST_DIR, "existing.jpg");
    await fs.writeFile(file, "fakeimg");

    const result = await downloadAndSaveImage({
      url: "http://fake.invalid/image.jpg",
      destDir: TEST_DIR,
      filename: "existing.jpg",
      fallback: "fallback.jpg",
      maxRetries: 1,
    });

    expect(result).toContain("existing.jpg");
  });

  it("returns fallback when download fails", async () => {
    const result = await downloadAndSaveImage({
      url: "http://invalid.invalid/notfound.jpg",
      destDir: TEST_DIR,
      filename: "new-image.jpg",
      fallback: "/images/fallback.jpg",
      maxRetries: 1,
    });

    expect(result).toBe("/images/fallback.jpg");
  });

  it("clearDownloadCache resets the cache", () => {
    expect(() => clearDownloadCache()).not.toThrow();
  });
});

describe("validation schemas", () => {
  describe("UserSeedSchema", () => {
    it("validates valid user data", () => {
      const validUser = {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      };
      const result = UserSeedSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const invalidUser = {
        id: "user-123",
        name: "John Doe",
        email: "not-an-email",
      };
      const result = UserSeedSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("accepts optional role field", () => {
      const userWithRole = {
        id: "user-123",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      };
      const result = UserSeedSchema.safeParse(userWithRole);
      expect(result.success).toBe(true);
    });
  });

  describe("AuthorSeedSchema", () => {
    it("validates valid author data", () => {
      const validAuthor = {
        name: "Test Author",
        bio: "A prolific writer",
        image: "https://example.com/author.jpg",
      };
      const result = AuthorSeedSchema.safeParse(validAuthor);
      expect(result.success).toBe(true);
    });

    it("allows minimal author data", () => {
      const minimalAuthor = { name: "Minimal Author" };
      const result = AuthorSeedSchema.safeParse(minimalAuthor);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const invalidAuthor = { name: "" };
      const result = AuthorSeedSchema.safeParse(invalidAuthor);
      expect(result.success).toBe(false);
    });

    it("accepts isActive flag", () => {
      const authorWithActive = { name: "Author", isActive: false };
      const result = AuthorSeedSchema.safeParse(authorWithActive);
      expect(result.success).toBe(true);
    });
  });

  describe("ArtistSeedSchema", () => {
    it("validates valid artist data", () => {
      const validArtist = {
        name: "Test Artist",
        bio: "Digital illustrator",
        isActive: true,
      };
      const result = ArtistSeedSchema.safeParse(validArtist);
      expect(result.success).toBe(true);
    });

    it("allows minimal artist data", () => {
      const minimalArtist = { name: "Simple Artist" };
      const result = ArtistSeedSchema.safeParse(minimalArtist);
      expect(result.success).toBe(true);
    });
  });

  describe("GenreSeedSchema", () => {
    it("validates valid genre data", () => {
      const validGenre = {
        name: "Action",
        slug: "action",
        description: "Action-packed adventures",
      };
      const result = GenreSeedSchema.safeParse(validGenre);
      expect(result.success).toBe(true);
    });

    it("allows genre without slug (will be auto-generated)", () => {
      const genreNoSlug = { name: "Fantasy" };
      const result = GenreSeedSchema.safeParse(genreNoSlug);
      expect(result.success).toBe(true);
    });

    it("accepts isActive flag", () => {
      const genre = { name: "Horror", isActive: false };
      const result = GenreSeedSchema.safeParse(genre);
      expect(result.success).toBe(true);
    });
  });

  describe("TypeSeedSchema", () => {
    it("validates valid type data", () => {
      const validType = {
        name: "Manga",
        description: "Japanese comics",
        isActive: true,
      };
      const result = TypeSeedSchema.safeParse(validType);
      expect(result.success).toBe(true);
    });

    it("allows minimal type data", () => {
      const minimalType = { name: "Manhwa" };
      const result = TypeSeedSchema.safeParse(minimalType);
      expect(result.success).toBe(true);
    });
  });

  describe("ComicSeedSchema", () => {
    it("validates valid comic data", () => {
      const validComic = {
        title: "Test Comic",
        slug: "test-comic",
        authorId: 1,
        publicationDate: "2024-01-01",
      };
      const result = ComicSeedSchema.safeParse(validComic);
      expect(result.success).toBe(true);
    });

    it("accepts full comic data", () => {
      const fullComic = {
        title: "Full Comic",
        slug: "full-comic",
        authorId: 1,
        artistId: 2,
        typeId: 1,
        coverImage: "https://example.com/cover.jpg",
        description: "A detailed description",
        genres: ["Action", "Adventure"],
        publicationDate: "2024-01-01",
        status: "Ongoing",
        views: 1000,
        rating: 4.5,
      };
      const result = ComicSeedSchema.safeParse(fullComic);
      expect(result.success).toBe(true);
    });
  });

  describe("ChapterSeedSchema", () => {
    it("validates valid chapter data", () => {
      const validChapter = {
        comicId: 1,
        title: "Chapter 1",
        slug: "chapter-1",
        images: ["https://example.com/page1.jpg"],
      };
      const result = ChapterSeedSchema.safeParse(validChapter);
      expect(result.success).toBe(true);
    });

    it("allows empty images array", () => {
      const chapterNoImages = {
        comicId: 1,
        title: "Chapter 2",
        slug: "chapter-2",
        images: [],
      };
      const result = ChapterSeedSchema.safeParse(chapterNoImages);
      expect(result.success).toBe(true);
    });

    it("accepts optional fields", () => {
      const fullChapter = {
        id: 1,
        comicId: 1,
        title: "Full Chapter",
        slug: "full-chapter",
        chapterNumber: 1,
        images: ["page1.jpg", "page2.jpg"],
        releaseDate: "2024-01-01",
        content: "Chapter content text",
        views: 500,
      };
      const result = ChapterSeedSchema.safeParse(fullChapter);
      expect(result.success).toBe(true);
    });
  });

  describe("SeedConfigSchema", () => {
    it("validates valid config", () => {
      const validConfig = {
        batchSize: 100,
        downloadConcurrency: 5,
        maxImageSize: 5242880,
        dryRun: false,
      };
      const result = SeedConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("uses default values for empty object", () => {
      const minimalConfig = {};
      const result = SeedConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dryRun).toBe(false);
        expect(result.data.batchSize).toBe(100);
        expect(result.data.downloadConcurrency).toBe(5);
      }
    });

    it("accepts all config options", () => {
      const fullConfig = {
        batchSize: 50,
        downloadConcurrency: 10,
        maxImageSize: 10485760,
        dryRun: true,
        skipImages: true,
        verbose: true,
      };
      const result = SeedConfigSchema.safeParse(fullConfig);
      expect(result.success).toBe(true);
    });
  });
});
