import { z } from "zod";

/**
 * Schema for search query parameters
 */
export const SearchParamsSchema = z.object({
  q: z.string().min(1, "Search query is required").max(100, "Query too long"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(10).max(100).default(20),
  genre: z.string().optional(),
  status: z.enum(["Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"]).optional(),
  sort: z.enum(["relevance", "newest", "popular", "rating"]).default("relevance"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Schema for quick search (modal)
 */
export const QuickSearchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().min(1).max(10).default(5),
});

export type QuickSearchParams = z.infer<typeof QuickSearchSchema>;
