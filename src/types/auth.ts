/**
 * Authentication Type Definitions
 * @description Types for NextAuth and auth-related operations
 */

import type { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

/**
 * Extended NextAuth User
 */
export interface User extends NextAuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: 'admin' | 'moderator' | 'user';
  emailVerified?: Date | null;
  isActive?: boolean;
}

/**
 * Extended NextAuth Session
 */
export interface Session extends NextAuthSession {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: 'admin' | 'moderator' | 'user';
  iat: number; // issued at
  exp: number; // expiration
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
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
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
  password: string;
  confirmPassword: string;
  token: string;
}

/**
 * OAuth account info
 */
export interface OAuthAccount {
  provider: 'google' | 'github';
  providerAccountId: string;
  email?: string;
  name?: string;
  image?: string;
}

/**
 * Auth callback result
 */
export interface AuthCallbackResult {
  success: boolean;
  error?: string;
  user?: User;
}

/**
 * Email verification token
 */
export interface EmailVerificationToken {
  email: string;
  token: string;
  expiresAt: Date;
}

/**
 * Permission level
 */
export type PermissionLevel = 'public' | 'authenticated' | 'moderator' | 'admin';

/**
 * Auth check result
 */
export interface AuthCheckResult {
  authenticated: boolean;
  user?: User;
  session?: Session;
}
