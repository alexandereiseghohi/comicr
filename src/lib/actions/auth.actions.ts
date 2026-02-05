import { randomBytes } from "node:crypto";

import { eq, gt } from "drizzle-orm";

import { auth } from "@/auth";
import { userDAL } from "@/dal/user-dal";
import { getUserByEmail } from "@/database/queries/user-queries";
import { passwordResetToken, user } from "@/database/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SignUpSchema } from "@/schemas/auth.schema";
import { type ActionResult } from "@/types";

import { db } from "../../database/db";

// ═══════════════════════════════════════════════════
// SIGN UP ACTION
// ═══════════════════════════════════════════════════

export type SignUpInput = {
  email: string;
  name?: string;
  password: string;
};

/**
 * Create a new user account with email/password
 */
export async function signUpAction(input: SignUpInput): Promise<ActionResult<{ userId: string }>> {
  try {
    // Validate input
    const validation = SignUpSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(input.email);
    if (existingUser.success && existingUser.data) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password with scrypt
    const hashedPassword = hashPassword(input.password);

    // Create user using mutation (since userDAL.create is a stub)
    const result = await import("@/database/mutations/user.mutations").then((m) =>
      m.createUser({
        email: input.email,
        name: input.name || null,
        password: hashedPassword,
      })
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || "Failed to create account",
      };
    }

    return { success: true, data: { userId: result.data.id } };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

// ═══════════════════════════════════════════════════
// PASSWORD RESET REQUEST ACTION
// ═══════════════════════════════════════════════════

/**
 * Generate a password reset token and store it
 * In production, this should send an email with the reset link
 */
export async function requestPasswordResetAction(email: string): Promise<ActionResult<{ message: string }>> {
  try {
    if (!email || typeof email !== "string") {
      return { success: false, error: "Email is required" };
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (!existingUser.success || !existingUser.data) {
      // Return success anyway to prevent email enumeration attacks
      return {
        success: true,
        data: {
          message: "If an account exists, a password reset link will be sent",
        },
      };
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const hashedToken = hashPassword(token); // Hash token before storage for security
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing tokens for this email
    await db.delete(passwordResetToken).where(eq(passwordResetToken.email, email));

    // Store the hashed token using mutation
    await import("../../database/mutations/password-reset-token.mutations").then((m) =>
      m.createPasswordResetToken({
        email,
        token: hashedToken,
        expires,
      })
    );

    // TODO: In production, send email with reset link containing the unhashed token
    // The URL should be: /reset-password?token={token}
    // For development, log the token (this would be sent via email in production)
    if (process.env.NODE_ENV === "development") {
      console.warn(`[DEV] Password reset token for ${email}: ${token}`);
    }

    return {
      success: true,
      data: {
        message: "If an account exists, a password reset link will be sent",
      },
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Failed to process password reset request",
    };
  }
}

// ═══════════════════════════════════════════════════
// RESET PASSWORD ACTION
// ═══════════════════════════════════════════════════

export type ResetPasswordInput = {
  confirmPassword: string;
  newPassword: string;
  token: string;
};

/**
 * Reset password using a valid token
 */
export async function resetPasswordAction(input: ResetPasswordInput): Promise<ActionResult<{ message: string }>> {
  try {
    const { token, newPassword, confirmPassword } = input;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }
    if (!/[a-z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one number",
      };
    }

    // Find all non-expired tokens for validation (we need to verify against hashed tokens)
    const tokenRecords = await db
      .select()
      .from(passwordResetToken)
      .where(gt(passwordResetToken.expires, new Date()))
      .limit(100);

    // Find matching token by verifying hash
    const tokenRecord = tokenRecords.find((record) => verifyPassword(token, record.token));

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Check if token has expired
    if (tokenRecord.expires < new Date()) {
      // Delete expired token
      await db.delete(passwordResetToken).where(eq(passwordResetToken.id, tokenRecord.id));
      return {
        success: false,
        error: "Reset token has expired. Please request a new one.",
      };
    }

    // Find the user
    const existingUser = await getUserByEmail(tokenRecord.email);
    if (!existingUser.success || !existingUser.data) {
      return { success: false, error: "User not found" };
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    await db
      .update(user)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existingUser.data.id));

    // Delete the used token by ID (since we store hashed tokens)
    await db.delete(passwordResetToken).where(eq(passwordResetToken.id, tokenRecord.id));

    return {
      success: true,
      data: { message: "Password has been reset successfully" },
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// ═══════════════════════════════════════════════════
// CHANGE PASSWORD ACTION (for authenticated users)
// ═══════════════════════════════════════════════════

export type ChangePasswordInput = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

/**
 * Change password for authenticated user
 */
export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult<{ message: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized - please sign in" };
    }

    const { currentPassword, newPassword, confirmPassword } = input;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }
    if (!/[a-z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[A-Z]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "Password must contain at least one number",
      };
    }

    // Get user with password
    const userResult = await userDAL.getById(session.user.id);
    const userRecord = userResult.success && userResult.data ? userResult.data : undefined;

    if (!userRecord) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    if (!userRecord.password || !verifyPassword(currentPassword, userRecord.password)) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Ensure new password is different
    if (currentPassword === newPassword) {
      return {
        success: false,
        error: "New password must be different from current password",
      };
    }

    // Hash and update
    const hashedPassword = hashPassword(newPassword);
    const updateResult = await userDAL.update(session.user.id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || "Failed to update password",
      };
    }

    return {
      success: true,
      data: { message: "Password changed successfully" },
    };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}
