import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { db } from "@/database/db";
import { getUserByEmail } from "@/database/queries/user-queries";
import { AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/env";
import { verifyPassword } from "@/lib/password";
import { type Session } from "@/types/auth";

/**
 * NextAuth configuration
 */
export const config: NextAuthConfig = {
  trustHost: true,
  secret: AUTH_SECRET,
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    // Google OAuth Provider
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),

    // GitHub OAuth Provider
    GitHub({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),

    // Credentials provider for email/password login
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const result = await getUserByEmail(email);
        if (!result.success || !result.data) {
          return null;
        }

        const user = result.data;
        if (!user.password || !verifyPassword(password, user.password)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/error",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    /**
     * Called whenever JWT is created or updated
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        token.role = (user as { role?: "admin" | "moderator" | "user" }).role || "user";
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
    async signIn({ user: _user, account: _account, profile: _profile }) {
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
     * Note: Logging moved to structured logger in production
     */
    async signIn({ user: _user, account: _account, profile: _profile }) {
      // Authentication events are handled by the audit system
      // See src/lib/audit for structured logging
    },

    /**
     * Called when a user is successfully signed out
     */
    async signOut() {
      // Sign out events handled by audit system
    },
  },
};

/**
 * Initialize NextAuth with configuration
 */
export const { handlers, auth, signIn, signOut } = NextAuth(config);
