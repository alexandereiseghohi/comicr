import { commentSchema } from "@/schemas/comment.schema";
import { describe, expect, it } from "vitest";

describe("commentSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid root comment", () => {
      const input = {
        chapterId: 1,
        content: "Great chapter!",
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBeUndefined();
      }
    });

    it("should accept valid reply comment", () => {
      const input = {
        chapterId: 1,
        content: "I agree!",
        parentId: 5,
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parentId).toBe(5);
      }
    });

    it("should accept content with max length (2000 chars)", () => {
      const input = {
        chapterId: 1,
        content: "a".repeat(2000),
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should trim whitespace from content", () => {
      const input = {
        chapterId: 1,
        content: "  Great chapter!  ",
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("Great chapter!");
      }
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty content", () => {
      const input = { chapterId: 1, content: "" };
      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject whitespace-only content", () => {
      const input = { chapterId: 1, content: "   " };
      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject content exceeding max length", () => {
      const input = {
        chapterId: 1,
        content: "a".repeat(2001),
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative chapterId", () => {
      const input = {
        chapterId: -1,
        content: "Great chapter!",
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject negative parentId", () => {
      const input = {
        chapterId: 1,
        content: "Great chapter!",
        parentId: -1,
      };

      const result = commentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const result = commentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
