import { type Metadata } from "next";
import { Suspense } from "react";

import { ComicFilters } from "@/components/comics/comic-filters";
import { ComicList } from "@/components/comics/comic-list";
import { ComicPagination } from "@/components/comics/comic-pagination";
import { GenreGrid } from "@/components/comics/genre-grid";
import * as comicQueries from "@/database/queries/comic-queries";
import * as genreQueries from "@/database/queries/genre.queries";

interface SearchParams {
  genres?: string;
  limit?: string;
  order?: "asc" | "desc";
  page?: string;
  search?: string;
  sort?: string;
  status?: string;
}

async function ComicsContent({ searchParams }: { searchParams: SearchParams }) {
  const {
    page: pageValue,
    limit: limitValue,
    sort: sortValue,
    search: searchValue,
    order: orderValue,
    status: statusValue,
    genres: genresValue,
  } = await searchParams;
  const page = parseInt(pageValue ?? "1");
  const limit = parseInt(limitValue ?? "20");
  const sort = sortValue || "createdAt";
  const order = orderValue === "asc" ? "asc" : "desc";
  const validStatuses = [
    "Ongoing",
    "Hiatus",
    "Completed",
    "Dropped",
    "Season End",
    "Coming Soon",
  ] as const;

  let result;

  if (searchValue) {
    result = await comicQueries.searchComics(searchValue, { page, limit });
  } else if (genresValue) {
    const genreSlugs = genresValue.split(",").filter(Boolean);
    result = await comicQueries.getComicsByGenres(genreSlugs, { page, limit, sort, order });
  } else if (
    statusValue &&
    statusValue !== "All" &&
    (validStatuses as readonly string[]).includes(statusValue)
  ) {
    // Narrow statusValue to the correct union type
    const narrowedStatus = validStatuses.find(
      (s) => s === statusValue
    ) as (typeof validStatuses)[number];
    result = await comicQueries.getComicsByStatus(narrowedStatus, {
      page,
      limit,
      sort,
      order,
    });
  } else {
    result = await comicQueries.getAllComics({ page, limit, sort, order });
  }

  if (!result.success) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">Error loading comics</h3>
          <p className="mt-2 text-sm text-slate-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const comics = (result.data || []).map((c) => ({
    ...c,
    rating: c.rating ? Number(c.rating) : 0,
  }));
  const total = result.total || 0;

  return (
    <div className="space-y-8">
      {/* Pagination - Top */}
      <ComicPagination currentPage={page} itemsPerPage={limit} totalItems={total} />

      {/* Comic List */}
      <ComicList comics={comics} />

      {/* Pagination - Bottom */}
      <ComicPagination currentPage={page} itemsPerPage={limit} totalItems={total} />
    </div>
  );
}

async function GenreDiscovery() {
  const genresResult = await genreQueries.getGenresWithComicCount(8);

  if (!genresResult.success || !genresResult.data || genresResult.data.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-950">Browse by Genre</h2>
        <p className="text-slate-600">Explore comics by your favorite genres</p>
      </div>
      <GenreGrid genres={genresResult.data} />
    </div>
  );
}

export default async function ComicsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const hasActiveFilters = !!(params.search || params.status || params.genres);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-950">Comics</h1>
          <p className="text-lg text-slate-600">Discover and read amazing comics</p>
        </div>

        {/* Genre Discovery - Only show when no filters active */}
        {!hasActiveFilters && (
          <Suspense
            fallback={
              <div className="mb-12">
                <div className="mb-6">
                  <div className="mb-2 h-8 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-64 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div className="h-32 animate-pulse rounded-lg bg-slate-100" key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <GenreDiscovery />
          </Suspense>
        )}

        {/* Filters */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-16 animate-pulse rounded-lg bg-slate-100" />}>
            <ComicFilters />
          </Suspense>
        </div>

        {/* Content */}
        <Suspense
          fallback={
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="h-72 animate-pulse rounded-lg bg-slate-200" key={i} />
              ))}
            </div>
          }
        >
          <ComicsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Comics | ComicWise",
  description: "Browse and read amazing comics",
};
