import { ratingSchema } from "@/schemas/rating.schema";
import { describe, expect, it } from "vitest";

describe("ratingSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid rating with review", () => {
      const input = {
        comicId: 1,
        rating: 5,
        review: "Great comic!",
      };

      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should accept valid rating without review", () => {
      const input = {
        comicId: 1,
        rating: 3,
      };

      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.review).toBeUndefined();
      }
    });

    it("should accept all valid star ratings (1-5)", () => {
      for (let rating = 1; rating <= 5; rating++) {
        const result = ratingSchema.safeParse({ comicId: 1, rating });
        expect(result.success).toBe(true);
      }
    });

    it("should accept review with max length (1000 chars)", () => {
      const input = {
        comicId: 1,
        rating: 4,
        review: "a".repeat(1000),
      };

      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("should reject rating below 1", () => {
      const input = { comicId: 1, rating: 0 };
      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject rating above 5", () => {
      const input = { comicId: 1, rating: 6 };
      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject decimal ratings", () => {
      const input = { comicId: 1, rating: 3.5 };
      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative comicId", () => {
      const input = { comicId: -1, rating: 5 };
      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject review exceeding max length", () => {
      const input = {
        comicId: 1,
        rating: 5,
        review: "a".repeat(1001),
      };

      const result = ratingSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const result = ratingSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
