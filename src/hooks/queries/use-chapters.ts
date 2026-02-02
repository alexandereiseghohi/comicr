import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";

/**
 * Chapters Query Hooks
 * @description TanStack Query hooks for chapters data fetching
 */

// Types
interface Chapter {
  chapterNumber: number;
  comicId: number;
  content: null | string;
  id: number;
  releaseDate: Date;
  slug: string;
  title: string;
  views: number;
}

interface ChapterImage {
  chapterId: number;
  id: number;
  imageUrl: string;
  pageNumber: number;
}

interface ChaptersResponse {
  data: Chapter[];
  meta: {
    hasNextPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

// Fetch functions
async function fetchChaptersByComicId(
  comicId: number,
  page: number = 1,
  limit: number = 50
): Promise<ChaptersResponse> {
  const response = await fetch(`/api/comics/${comicId}/chapters?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  return response.json();
}

async function fetchChapterById(chapterId: number): Promise<Chapter> {
  const response = await fetch(`/api/chapters/${chapterId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch chapter");
  }
  const data = await response.json();
  return data.data;
}

async function fetchChapterImages(chapterId: number): Promise<ChapterImage[]> {
  const response = await fetch(`/api/chapters/${chapterId}/images`);
  if (!response.ok) {
    throw new Error("Failed to fetch chapter images");
  }
  const data = await response.json();
  return data.data;
}

// Hooks

/**
 * Fetch chapters for a comic
 */
export function useChapters(comicId: number, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.chapters.list(comicId),
    queryFn: () => fetchChaptersByComicId(comicId, page, limit),
    enabled: comicId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single chapter by ID
 */
export function useChapter(chapterId: number) {
  return useQuery({
    queryKey: queryKeys.chapters.detail(chapterId),
    queryFn: () => fetchChapterById(chapterId),
    enabled: chapterId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch chapter images/pages
 */
export function useChapterImages(chapterId: number) {
  return useQuery({
    queryKey: queryKeys.chapters.images(chapterId),
    queryFn: () => fetchChapterImages(chapterId),
    enabled: chapterId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Prefetch chapter and images (for next/prev navigation)
 */
export function usePrefetchChapter() {
  const queryClient = useQueryClient();

  return (chapterId: number) => {
    // Prefetch chapter data
    queryClient.prefetchQuery({
      queryKey: queryKeys.chapters.detail(chapterId),
      queryFn: () => fetchChapterById(chapterId),
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch chapter images
    queryClient.prefetchQuery({
      queryKey: queryKeys.chapters.images(chapterId),
      queryFn: () => fetchChapterImages(chapterId),
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Increment chapter views
 */
export function useIncrementChapterViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: number) => {
      const response = await fetch(`/api/chapters/${chapterId}/view`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to increment views");
      }
      return response.json();
    },
    onSuccess: (_, chapterId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chapters.detail(chapterId),
      });
    },
  });
}
