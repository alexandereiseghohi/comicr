import { type NextRequest, NextResponse } from "next/server";

import { type Session } from "@/types/auth";

import { auth } from "./auth";

/**
 * Simple in-memory rate limiter
 * In production, use Redis for distributed rate limiting
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 attempts per window for auth routes
const RATE_LIMIT_MAX_GENERAL = 100; // Max 100 requests per window for general routes

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check rate limit for a given key
 */
function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Clean up old rate limit entries periodically
 */
function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.lastReset > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

/**
 * Auth routes that need stricter rate limiting
 */
const AUTH_ROUTES = [
  "/api/auth/signin",
  "/api/auth/callback",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = ["/profile", "/bookmarks", "/settings", "/admin"];

/**
 * Check if path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Middleware function
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const session = (await auth()) as null | Session;
    if (!session?.user) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Admin routes require admin role
    if (pathname.startsWith("/admin") && session.user.role !== "admin") {
      return new NextResponse(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Determine rate limit based on route type
  const isAuth = isAuthRoute(pathname);
  const rateLimitKey = isAuth ? `auth:${clientIP}` : `general:${clientIP}`;
  const maxRequests = isAuth ? RATE_LIMIT_MAX_REQUESTS : RATE_LIMIT_MAX_GENERAL;

  const { allowed, remaining } = checkRateLimit(rateLimitKey, maxRequests);

  // Create response with rate limit headers
  const response = NextResponse.next();

  response.headers.set("X-RateLimit-Limit", maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", (RATE_LIMIT_WINDOW_MS / 1000).toString());

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": (RATE_LIMIT_WINDOW_MS / 1000).toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": (RATE_LIMIT_WINDOW_MS / 1000).toString(),
        },
      }
    );
  }

  return response;
}

/**
 * Configure which routes use this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
