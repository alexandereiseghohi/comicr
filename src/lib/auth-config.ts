/**
 * NextAuth v5 Configuration
 * @description Complete authentication setup with OAuth providers
 */

import { db } from "@/database/db";
import {
  AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "@/lib/env";
import type { Session } from "@/types/auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * NextAuth configuration
 */
export const config: NextAuthConfig = {
  trustHost: true,
  secret: AUTH_SECRET,
  adapter: DrizzleAdapter(db),
  providers: [
    // Google OAuth Provider
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub OAuth Provider
    GitHub({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials provider for email/password login
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Implementation for credentials authentication
        // This is a placeholder - implement your own logic
        if (!credentials.email || !credentials.password) {
          return null;
        }

        // TODO: Implement database lookup and password verification
        // using bcrypt or similar
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    /**
     * Called whenever JWT is created or updated
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "user";
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    /**
     * Called whenever session is checked
     */
    async session({ session, token }) {
      const typedSession = session as Session;
      if (typedSession.user) {
        typedSession.user.id = token.id as string;
        typedSession.user.role = (token.role as "admin" | "moderator" | "user") || "user";
      }
      return typedSession;
    },

    /**
     * Called on successful signin
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile }) {
      // You can implement additional checks here
      // Return false to reject sign-in
      return true;
    },

    /**
     * Called when redirecting on signin/out
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    /**
     * Called when a user is successfully signed in
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email}`);
    },

    /**
     * Called when a user is successfully signed out
     */
    async signOut() {
      console.log("User signed out");
    },
  },
};

/**
 * Initialize NextAuth with configuration
 */
export const { handlers, auth, signIn, signOut } = NextAuth(config);
