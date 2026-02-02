/**
 * Authentication Type Definitions
 * @description Types for NextAuth and auth-related operations
 */

import type { Session as NextAuthSession, User as NextAuthUser } from "next-auth";

/**
 * Extended NextAuth User
 */
export interface AuthUser extends NextAuthUser {
  email: string;
  emailVerified?: Date | null;
  id: string;
  image?: null | string;
  isActive?: boolean;
  name?: null | string;
  role?: "admin" | "moderator" | "user";
}

/**
 * Extended NextAuth Session
 */
export interface Session extends NextAuthSession {
  accessToken?: string;
  expiresAt?: number;
  refreshToken?: string;
  user: AuthUser;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  email: string;
  exp: number; // expiration
  iat: number; // issued at
  role: "admin" | "moderator" | "user";
  sub: string; // user ID
}

/**
 * Sign-in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign-up data
 */
export interface SignUpData {
  confirmPassword: string;
  email: string;
  name?: string;
  password: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset form
 */
export interface PasswordResetForm {
  confirmPassword: string;
  password: string;
  token: string;
}

/**
 * OAuth account info
 */
export interface OAuthAccount {
  email?: string;
  image?: string;
  name?: string;
  provider: "github" | "google";
  providerAccountId: string;
}

/**
 * Auth callback result
 */
export interface AuthCallbackResult {
  error?: string;
  success: boolean;
  user?: AuthUser;
}

/**
 * Email verification token
 */
export interface EmailVerificationToken {
  email: string;
  expiresAt: Date;
  token: string;
}

/**
 * Permission level
 */
export type PermissionLevel = "admin" | "authenticated" | "moderator" | "public";

/**
 * Auth check result
 */
export interface AuthCheckResult {
  authenticated: boolean;
  session?: Session;
  user?: AuthUser;
}
