/**
 * Common Type Definitions
 * @description Shared types used across the application
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

/**
 * Generic Action Result
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
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
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, unknown>;
}

/**
 * Notification object
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * File metadata
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

/**
 * User session data
 */
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: 'admin' | 'moderator' | 'user';
}

/**
 * Generic dictionary/map type
 */
export type Dict<T = unknown> = Record<string, T>;

/**
 * Nullable type utility
 */
export type Nullable<T> = T | null;

/**
 * Optional type utility
 */
export type Optional<T> = T | undefined;

/**
 * Promise type utility
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = Awaited<
  ReturnType<T>
>;
