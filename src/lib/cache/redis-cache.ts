/**
 * Standard Redis Cache Provider
 * @description Local Redis caching via ioredis for development
 */

import { getEnv } from "@/lib/env";
import Redis from "ioredis";
import type {
  CacheDeleteResult,
  CacheOptions,
  CacheProvider,
  CacheResult,
  CacheSetResult,
} from "./types";
import { DEFAULT_CACHE_CONFIG } from "./types";

let redisClient: Redis | null = null;

/**
 * Get or create ioredis client
 */
function getClient(): Redis {
  if (!redisClient) {
    const env = getEnv();
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: 0,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.error("[RedisCache] Connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("[RedisCache] Connected to Redis");
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
 * Standard Redis Cache Provider Implementation
 */
export class RedisCacheProvider implements CacheProvider {
  readonly name = "redis" as const;

  async get<T>(key: string): Promise<CacheResult<T>> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      const value = await client.get(fullKey);

      if (value === null) {
        return { value: null, hit: false, key: fullKey };
      }

      const ttl = await client.ttl(fullKey);
      const parsed = JSON.parse(value) as T;
      return { value: parsed, hit: true, key: fullKey, ttl: ttl > 0 ? ttl : undefined };
    } catch (error) {
      console.error("[RedisCache] Get error:", error);
      return { value: null, hit: false, key: buildKey(key) };
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<CacheSetResult> {
    try {
      const client = getClient();
      const fullKey = buildKey(key, options.prefix);
      const ttl = options.ttl ?? DEFAULT_CACHE_CONFIG.ttl;
      const serialized = JSON.stringify(value);

      if (ttl > 0) {
        await client.setex(fullKey, ttl, serialized);
      } else {
        await client.set(fullKey, serialized);
      }

      // Store tags for invalidation if provided
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await client.sadd(`${DEFAULT_CACHE_CONFIG.prefix}tags:${tag}`, fullKey);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("[RedisCache] Set error:", error);
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
      console.error("[RedisCache] Delete error:", error);
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

      // Use SCAN to find matching keys
      let cursor = "0";
      let totalDeleted = 0;

      do {
        const [newCursor, keys] = await client.scan(cursor, "MATCH", fullPattern, "COUNT", 100);
        cursor = newCursor;

        if (keys.length > 0) {
          const deleted = await client.del(...keys);
          totalDeleted += deleted;
        }
      } while (cursor !== "0");

      return { success: true, count: totalDeleted };
    } catch (error) {
      console.error("[RedisCache] DeletePattern error:", error);
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
      console.error("[RedisCache] Exists error:", error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = getClient();
      const fullKey = buildKey(key);
      return await client.ttl(fullKey);
    } catch (error) {
      console.error("[RedisCache] TTL error:", error);
      return -2; // Key doesn't exist
    }
  }

  async flush(): Promise<void> {
    try {
      // Only flush keys with our prefix for safety
      await this.deletePattern("*");
    } catch (error) {
      console.error("[RedisCache] Flush error:", error);
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
      console.error("[RedisCache] InvalidateTag error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Tag invalidation failed",
      };
    }
  }

  /**
   * Gracefully close the connection
   */
  async disconnect(): Promise<void> {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
  }
}

export const redisCacheProvider = new RedisCacheProvider();
