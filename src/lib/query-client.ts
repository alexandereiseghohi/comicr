/**
 * TanStack Query Client Configuration
 * @description Centralized React Query client with optimized defaults
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Create a new QueryClient with optimized defaults
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed queries 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === "development",
        // Don't refetch on reconnect unless stale
        refetchOnReconnect: "always",
        // Keep previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

// Browser: create a singleton client
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get the QueryClient instance
 * - Server: Creates a new client per request
 * - Browser: Returns singleton client
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always make a new client
    return makeQueryClient();
  }

  // Browser: use singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Query keys for type-safe cache management
 */
export const queryKeys = {
  // Comics
  comics: {
    all: ["comics"] as const,
    lists: () => [...queryKeys.comics.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.comics.lists(), filters] as const,
    details: () => [...queryKeys.comics.all, "detail"] as const,
    detail: (idOrSlug: string | number) => [...queryKeys.comics.details(), idOrSlug] as const,
    trending: (period: string) => [...queryKeys.comics.all, "trending", period] as const,
  },

  // Chapters
  chapters: {
    all: ["chapters"] as const,
    lists: () => [...queryKeys.chapters.all, "list"] as const,
    list: (comicId: number) => [...queryKeys.chapters.lists(), comicId] as const,
    details: () => [...queryKeys.chapters.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.chapters.details(), id] as const,
    images: (chapterId: number) => [...queryKeys.chapters.all, "images", chapterId] as const,
  },

  // Bookmarks
  bookmarks: {
    all: ["bookmarks"] as const,
    lists: () => [...queryKeys.bookmarks.all, "list"] as const,
    list: (userId: string) => [...queryKeys.bookmarks.lists(), userId] as const,
    detail: (userId: string, comicId: number) =>
      [...queryKeys.bookmarks.all, userId, comicId] as const,
  },

  // Reading Progress
  readingProgress: {
    all: ["readingProgress"] as const,
    lists: () => [...queryKeys.readingProgress.all, "list"] as const,
    list: (userId: string) => [...queryKeys.readingProgress.lists(), userId] as const,
    detail: (userId: string, comicId: number) =>
      [...queryKeys.readingProgress.all, userId, comicId] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, "profile", id] as const,
  },

  // Search
  search: {
    all: ["search"] as const,
    results: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.search.all, query, filters] as const,
    suggestions: (query: string) => [...queryKeys.search.all, "suggestions", query] as const,
  },

  // Meta/Reference data
  genres: {
    all: ["genres"] as const,
    list: () => [...queryKeys.genres.all, "list"] as const,
  },

  authors: {
    all: ["authors"] as const,
    list: (page: number, limit: number) => [...queryKeys.authors.all, "list", page, limit] as const,
    detail: (id: number) => [...queryKeys.authors.all, "detail", id] as const,
  },

  artists: {
    all: ["artists"] as const,
    list: (page: number, limit: number) => [...queryKeys.artists.all, "list", page, limit] as const,
    detail: (id: number) => [...queryKeys.artists.all, "detail", id] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (userId: string) => [...queryKeys.notifications.all, userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all, "unread", userId] as const,
  },
} as const;

export default getQueryClient;
