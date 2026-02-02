/**
 * Common Type Definitions
 * @description Shared types used across the application
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp?: number;
}

/**
 * Generic Action Result
 */
export interface ActionResult<T = unknown> {
  data?: T;
  error?: string;
  ok: boolean;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Error response
 */
export interface ErrorResponse {
  code?: string;
  details?: Record<string, unknown>;
  error: string;
  success: false;
}

/**
 * Search parameters interface
 */
export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

/**
 * Query options
 */
export interface QueryOptions {
  filter?: Record<string, unknown>;
  limit?: number;
  order?: "asc" | "desc";
  page?: number;
  search?: string;
  sort?: string;
}

/**
 * Notification object
 */
export interface Notification {
  duration?: number;
  id: string;
  message: string;
  type: "error" | "info" | "success" | "warning";
}

/**
 * File metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url: string;
}

/**
 * User session data
 */
export interface SessionUser {
  email: string;
  id: string;
  image?: string;
  name?: string;
  role?: "admin" | "moderator" | "user";
}

/**
 * Generic dictionary/map type
 */
export type Dict<T = unknown> = Record<string, T>;

/**
 * Nullable type utility
 */
export type Nullable<T> = null | T;

/**
 * Optional type utility
 */
export type Optional<T> = T | undefined;

/**
 * Promise type utility
 */
export type AsyncReturnType<
  T extends (...args: unknown[]) => Promise<unknown>,
> = Awaited<ReturnType<T>>;
