import { Redis } from "@upstash/redis";

import { getEnv } from "@/lib/env";

import {
  type CacheDeleteResult,
  type CacheOptions,
  type CacheProvider,
  type CacheResult,
  type CacheSetResult,
  DEFAULT_CACHE_CONFIG,
} from "./types";

let redisClient: null | Redis = null;

/**
 * Get or create Upstash Redis client
 */
function getClient(): Redis {
  if (!redisClient) {
    const env = getEnv();
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Upstash Redis credentials not configured");
    }
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}

/**
 * Build full cache key with prefix
 */
function buildKey(key: string, prefix?: string): string {
  const basePrefix = prefix || DEFAULT_CACHE_CONFIG.prefix;
  return `${basePrefix}${key}`;
}

/**
 * Upstash Redis Cache Provider Implementation
 */
export class UpstashCacheProvider implements CacheProvider {
  readonly name = "upstash" as const;

  async get<T>(key: string): Promise<CacheResult<T>> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      const value = await client.get<T>(fullKey);

      if (value === null) {
        return { value: null, hit: false, key: fullKey };
      }

      const ttl = await client.ttl(fullKey);
      return { value, hit: true, key: fullKey, ttl: ttl > 0 ? ttl : undefined };
    } catch (error) {
      console.error("[UpstashCache] Get error:", error);
      return { value: null, hit: false, key: buildKey(key) };
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<CacheSetResult> {
    try {
      const client = getClient();
      const fullKey = buildKey(key, options.prefix);
      const ttl = options.ttl ?? DEFAULT_CACHE_CONFIG.ttl;

      if (ttl > 0) {
        await client.setex(fullKey, ttl, value);
      } else {
        await client.set(fullKey, value);
      }

      // Store tags for invalidation if provided
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await client.sadd(`${DEFAULT_CACHE_CONFIG.prefix}tags:${tag}`, fullKey);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("[UpstashCache] Set error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cache set failed",
      };
    }
  }

  async delete(key: string): Promise<CacheDeleteResult> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      const count = await client.del(fullKey);
      return { success: true, count };
    } catch (error) {
      console.error("[UpstashCache] Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cache delete failed",
      };
    }
  }

  async deletePattern(pattern: string): Promise<CacheDeleteResult> {
    try {
      const client = getClient();
      const fullPattern = buildKey(pattern);

      // Use SCAN to find matching keys (Upstash supports this)
      let cursor = "0";
      let totalDeleted = 0;

      do {
        const result = await client.scan(cursor, {
          match: fullPattern,
          count: 100,
        });
        const [nextCursor, keys] = result as unknown as [string, string[]];
        cursor = nextCursor;

        if (keys.length > 0) {
          const deleted = await client.del(...keys);
          totalDeleted += deleted;
        }
      } while (cursor !== "0");

      return { success: true, count: totalDeleted };
    } catch (error) {
      console.error("[UpstashCache] DeletePattern error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cache delete pattern failed",
      };
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      const result = await client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error("[UpstashCache] Exists error:", error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      return await client.ttl(fullKey);
    } catch (error) {
      console.error("[UpstashCache] TTL error:", error);
      return -2; // Key doesn't exist
    }
  }

  async flush(): Promise<void> {
    try {
      // Only flush keys with our prefix for safety
      await this.deletePattern("*");
    } catch (error) {
      console.error("[UpstashCache] Flush error:", error);
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateTag(tag: string): Promise<CacheDeleteResult> {
    try {
      const client = getClient();
      const tagKey = `${DEFAULT_CACHE_CONFIG.prefix}tags:${tag}`;

      // Get all keys associated with this tag
      const keys = await client.smembers(tagKey);

      if (keys.length > 0) {
        const deleted = await client.del(...keys);
        await client.del(tagKey);
        return { success: true, count: deleted };
      }

      return { success: true, count: 0 };
    } catch (error) {
      console.error("[UpstashCache] InvalidateTag error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Tag invalidation failed",
      };
    }
  }
}

export const upstashCacheProvider = new UpstashCacheProvider();
