/**
 * API Type Definitions
 * @description Types for API routes and requests/responses
 */

import type { NextRequest, NextResponse } from 'next/server';

/**
 * API Route Handler type
 */
export type ApiHandler<T = unknown> = (request: NextRequest) => Promise<NextResponse<T>>;

/**
 * API Query parameters
 */
export interface ApiQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, string>;
}

/**
 * Standard API endpoint response
 */
export interface ApiEndpointResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: number;
    version: string;
  };
}

/**
 * List endpoint response with pagination
 */
export interface ListEndpointResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    timestamp: number;
    took: number; // milliseconds
  };
}

/**
 * Error response format
 */
export interface ErrorEndpointResponse {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
  };
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

/**
 * Request context with user info
 */
export interface RequestContext {
  userId?: string;
  userRole?: 'admin' | 'moderator' | 'user';
  ip?: string;
  userAgent?: string;
}
