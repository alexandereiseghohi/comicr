/**
 * Cache Provider Types
 * @description Type definitions for the dual Redis caching abstraction
 */

export type CacheProviderType = "memory" | "redis" | "upstash";

export interface CacheOptions {
  /** Cache key prefix */
  prefix?: string;
  /** Tags for cache invalidation */
  tags?: string[];
  /** Time to live in seconds */
  ttl?: number;
}

export interface CacheResult<T> {
  /** Whether the value was found in cache */
  hit: boolean;
  /** Cache key that was used */
  key: string;
  /** Time remaining until expiration (seconds) */
  ttl?: number;
  /** Cached value or null if not found */
  value: null | T;
}

export interface CacheSetResult {
  error?: string;
  success: boolean;
}

export interface CacheDeleteResult {
  /** Number of keys deleted */
  count?: number;
  error?: string;
  success: boolean;
}

/**
 * Cache Provider Interface
 * All cache implementations must implement this interface
 */
export interface CacheProvider {
  /**
   * Delete a value from cache
   * @param key - Cache key or pattern
   */
  delete(key: string): Promise<CacheDeleteResult>;

  /**
   * Delete multiple keys by pattern
   * @param pattern - Key pattern (e.g., "comics:*")
   */
  deletePattern(pattern: string): Promise<CacheDeleteResult>;

  /**
   * Check if a key exists in cache
   * @param key - Cache key
   */
  exists(key: string): Promise<boolean>;

  /**
   * Flush all keys (use with caution)
   */
  flush(): Promise<void>;

  /**
   * Get a value from cache
   * @param key - Cache key
   */
  get<T>(key: string): Promise<CacheResult<T>>;

  /** Provider name for identification */
  readonly name: CacheProviderType;

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache (will be JSON serialized)
   * @param options - Cache options
   */
  set<T>(key: string, value: T, options?: CacheOptions): Promise<CacheSetResult>;

  /**
   * Get remaining TTL for a key
   * @param key - Cache key
   */
  ttl(key: string): Promise<number>;
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG = {
  /** Default TTL in seconds (1 hour) */
  ttl: 3600,
  /** Default key prefix */
  prefix: "comicwise:",
  /** Default stale-while-revalidate window (5 minutes) */
  staleWindow: 300,
} as const;

/**
 * Cache key generators for common entities
 */
export const cacheKeys = {
  /** Comic list cache key */
  comicList: (page: number, limit: number, filters?: string) =>
    `comics:list:${page}:${limit}${filters ? `:${filters}` : ""}`,

  /** Single comic cache key */
  comic: (idOrSlug: number | string) => `comics:single:${idOrSlug}`,

  /** Chapter list for a comic */
  chapterList: (comicId: number) => `chapters:list:${comicId}`,

  /** Single chapter cache key */
  chapter: (id: number) => `chapters:single:${id}`,

  /** User cache key */
  user: (id: string) => `users:${id}`,

  /** Search results cache key */
  search: (query: string, page: number) => `search:${encodeURIComponent(query)}:${page}`,

  /** Genre list cache key */
  genres: () => "genres:all",

  /** Author list cache key */
  authors: (page: number, limit: number) => `authors:list:${page}:${limit}`,

  /** Trending/popular comics */
  trending: (period: "day" | "month" | "week") => `trending:${period}`,
} as const;

/**
 * Higher-order function for caching
 * Wraps a function to automatically cache its results
 */
export type WithCacheOptions<T> = CacheOptions & {
  /** Function to generate cache key from arguments */
  keyGenerator: (...args: unknown[]) => string;
  /** Callback when cache is hit */
  onHit?: (key: string, value: T) => void;
  /** Callback when cache is missed */
  onMiss?: (key: string) => void;
  /** Whether to return stale data while revalidating */
  staleWhileRevalidate?: boolean;
};
