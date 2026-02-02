import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";

/**
 * Comics Query Hooks
 * @description TanStack Query hooks for comics data fetching
 */


// Types
interface Comic {
  coverImage: string;
  createdAt: Date;
  description: string;
  id: number;
  rating: null | string;
  slug: string;
  status: string;
  title: string;
  views: number;
}

interface ComicsResponse {
  data: Comic[];
  meta: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

interface ComicFilters {
  genre?: string;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: string;
  status?: string;
}

// Fetch functions
async function fetchComics(filters: ComicFilters = {}): Promise<ComicsResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`/api/comics?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comics");
  }
  return response.json();
}

async function fetchComicBySlug(slug: string): Promise<Comic> {
  const response = await fetch(`/api/comics/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch comic");
  }
  const data = await response.json();
  return data.data;
}

async function fetchTrendingComics(period: "day" | "month" | "week" = "week"): Promise<Comic[]> {
  const response = await fetch(`/api/comics/trending?period=${period}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trending comics");
  }
  const data = await response.json();
  return data.data;
}

// Hooks

/**
 * Fetch paginated list of comics
 */
export function useComics(filters: ComicFilters = {}) {
  return useQuery({
    queryKey: queryKeys.comics.list(filters as Record<string, unknown>),
    queryFn: () => fetchComics(filters),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch comics with infinite scroll pagination
 */
export function useInfiniteComics(filters: Omit<ComicFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.comics.list({ ...filters, infinite: true } as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) => fetchComics({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch a single comic by slug
 */
export function useComic(slug: string) {
  return useQuery({
    queryKey: queryKeys.comics.detail(slug),
    queryFn: () => fetchComicBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch trending comics
 */
export function useTrendingComics(period: "day" | "month" | "week" = "week") {
  return useQuery({
    queryKey: queryKeys.comics.trending(period),
    queryFn: () => fetchTrendingComics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch a comic (for hover/preload)
 */
export function usePrefetchComic() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.comics.detail(slug),
      queryFn: () => fetchComicBySlug(slug),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Increment comic views
 */
export function useIncrementComicViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comicId: number) => {
      const response = await fetch(`/api/comics/${comicId}/view`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to increment views");
      }
      return response.json();
    },
    onSuccess: (_, comicId) => {
      // Invalidate the specific comic query
      queryClient.invalidateQueries({
        queryKey: queryKeys.comics.detail(comicId),
      });
    },
  });
}
