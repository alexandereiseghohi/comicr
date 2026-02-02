import { type NextRequest, type NextResponse } from "next/server";

/**
 * API Route Handler type
 */
export type ApiHandler<T = unknown> = (request: NextRequest) => Promise<NextResponse<T>>;

/**
 * API Query parameters
 */
export interface ApiQuery {
  filter?: Record<string, string>;
  limit?: string;
  order?: "asc" | "desc";
  page?: string;
  search?: string;
  sort?: string;
}

/**
 * Standard API endpoint response
 */
export interface ApiEndpointResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    details?: Record<string, unknown>;
    message: string;
  };
  meta?: {
    timestamp: number;
    version: string;
  };
  success: boolean;
}

/**
 * List endpoint response with pagination
 */
export interface ListEndpointResponse<T> {
  data: T[];
  meta: {
    timestamp: number;
    took: number; // milliseconds
  };
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

/**
 * Error response format
 */
export interface ErrorEndpointResponse {
  error: {
    code: string;
    message: string;
    status: number;
  };
  success: false;
}

/**
 * HTTP methods
 */
export type HttpMethod = "DELETE" | "GET" | "OPTIONS" | "PATCH" | "POST" | "PUT";

/**
 * Request context with user info
 */
export interface RequestContext {
  ip?: string;
  userAgent?: string;
  userId?: string;
  userRole?: "admin" | "moderator" | "user";
}
