import { RedisCacheProvider } from "./redis-cache";
import {
  cacheKeys,
  type CacheOptions,
  type CacheProvider,
  type CacheProviderType,
  DEFAULT_CACHE_CONFIG,
  type WithCacheOptions,
} from "./types";
import { UpstashCacheProvider } from "./upstash-cache";

// Export types and utilities
export * from "./types";

// Provider instances (lazy loaded)
let currentProvider: CacheProvider | null = null;

/**
 * Determine which cache provider to use based on environment
 */
function detectProvider(): CacheProviderType {
  // Prefer Upstash in production/serverless environments
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return "upstash";
  }
  // Fall back to local Redis in development
  if (process.env.REDIS_HOST) {
    return "redis";
  }
  // Default to Upstash if configured
  return "upstash";
}

/**
 * Get the current cache provider based on environment
 * @returns CacheProvider instance
 */
export function getCacheProvider(): CacheProvider {
  if (!currentProvider) {
    const providerType = detectProvider();

    switch (providerType) {
      case "upstash":
        currentProvider = new UpstashCacheProvider();
        break;
      case "redis":
        currentProvider = new RedisCacheProvider();
        break;
      default:
        currentProvider = new UpstashCacheProvider();
    }

    console.log(`[Cache] Using ${currentProvider.name} provider`);
  }
  return currentProvider;
}

/**
 * Get a specific cache provider by name
 */
export function getCacheProviderByName(name: CacheProviderType): CacheProvider {
  switch (name) {
    case "upstash":
      return new UpstashCacheProvider();
    case "redis":
      return new RedisCacheProvider();
    default:
      throw new Error(`Unknown cache provider: ${name}`);
  }
}

/**
 * Higher-order function to wrap any async function with caching
 *
 * @example
 * const cachedGetComics = withCache(getComics, {
 *   keyGenerator: (page, limit) => cacheKeys.comicList(page, limit),
 *   ttl: 300,
 *   tags: ['comics']
 * });
 */
export function withCache<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: WithCacheOptions<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const cache = getCacheProvider();
    const key = options.keyGenerator(...args);

    // Try to get from cache
    const cached = await cache.get<TResult>(key);

    if (cached.hit && cached.value !== null) {
      options.onHit?.(key, cached.value);

      // Stale-while-revalidate: return cached but refresh in background
      if (options.staleWhileRevalidate && cached.ttl && cached.ttl < DEFAULT_CACHE_CONFIG.staleWindow) {
        // Refresh in background without blocking
        fn(...args).then((freshValue) => {
          cache.set(key, freshValue, {
            ttl: options.ttl,
            prefix: options.prefix,
            tags: options.tags,
          });
        });
      }

      return cached.value;
    }

    options.onMiss?.(key);

    // Cache miss - fetch fresh data
    const result = await fn(...args);

    // Store in cache
    await cache.set(key, result, {
      ttl: options.ttl,
      prefix: options.prefix,
      tags: options.tags,
    });

    return result;
  };
}

/**
 * Convenience methods for common cache operations
 */
export const cache = {
  get: <T>(key: string) => getCacheProvider().get<T>(key),
  set: <T>(key: string, value: T, options?: CacheOptions) => getCacheProvider().set(key, value, options),
  delete: (key: string) => getCacheProvider().delete(key),
  deletePattern: (pattern: string) => getCacheProvider().deletePattern(pattern),
  exists: (key: string) => getCacheProvider().exists(key),
  ttl: (key: string) => getCacheProvider().ttl(key),
  flush: () => getCacheProvider().flush(),
  keys: cacheKeys,
};

// Default export
export default cache;
