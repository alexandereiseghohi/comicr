import { describe, expect, it } from "vitest";

import { changePasswordSchema } from "@/schemas/password-schema";

describe("changePasswordSchema", () => {
  describe("valid inputs", () => {
    it("should accept valid password change", () => {
      const input = {
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
        confirmPassword: "NewPass456",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should accept passwords with special characters", () => {
      const input = {
        currentPassword: "OldPass123!",
        newPassword: "NewPass456@",
        confirmPassword: "NewPass456@",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs - password requirements", () => {
    it("should reject password shorter than 8 characters", () => {
      const input = {
        currentPassword: "Old123",
        newPassword: "New456",
        confirmPassword: "New456",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase letter", () => {
      const input = {
        currentPassword: "OLDPASS123",
        newPassword: "NEWPASS456",
        confirmPassword: "NEWPASS456",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase letter", () => {
      const input = {
        currentPassword: "oldpass123",
        newPassword: "newpass456",
        confirmPassword: "newpass456",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const input = {
        currentPassword: "OldPassword",
        newPassword: "NewPassword",
        confirmPassword: "NewPassword",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("invalid inputs - password matching", () => {
    it("should reject when passwords don't match", () => {
      const input = {
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
        confirmPassword: "DifferentPass789",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("match");
      }
    });

    it("should reject when new password equals current password", () => {
      const input = {
        currentPassword: "SamePass123",
        newPassword: "SamePass123",
        confirmPassword: "SamePass123",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("different");
      }
    });
  });

  describe("invalid inputs - missing fields", () => {
    it("should reject missing fields", () => {
      const result = changePasswordSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject partial input", () => {
      const input = {
        currentPassword: "OldPass123",
        newPassword: "NewPass456",
      };

      const result = changePasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
