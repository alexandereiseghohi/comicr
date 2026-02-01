import { ComicFilters } from "@/components/comics/comic-filters";
import { ComicList } from "@/components/comics/comic-list";
import { ComicPagination } from "@/components/comics/comic-pagination";
import { GenreGrid } from "@/components/comics/genre-grid";
import * as comicQueries from "@/database/queries/comic-queries";
import * as genreQueries from "@/database/queries/genre.queries";
import { Metadata } from "next";
import { Suspense } from "react";

interface SearchParams {
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: string;
  limit?: string;
  genres?: string;
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">Error loading comics</h3>
          <p className="text-sm text-slate-600 mt-2">{result.error}</p>
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
      <ComicPagination currentPage={page} totalItems={total} itemsPerPage={limit} />

      {/* Comic List */}
      <ComicList comics={comics} />

      {/* Pagination - Bottom */}
      <ComicPagination currentPage={page} totalItems={total} itemsPerPage={limit} />
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
        <h2 className="text-2xl font-bold text-slate-950 mb-2">Browse by Genre</h2>
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
          <h1 className="text-4xl font-bold text-slate-950 mb-2">Comics</h1>
          <p className="text-lg text-slate-600">Discover and read amazing comics</p>
        </div>

        {/* Genre Discovery - Only show when no filters active */}
        {!hasActiveFilters && (
          <Suspense
            fallback={
              <div className="mb-12">
                <div className="mb-6">
                  <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-5 w-64 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-slate-100 rounded-lg h-32 animate-pulse" />
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
          <Suspense fallback={<div className="h-16 bg-slate-100 rounded-lg animate-pulse" />}>
            <ComicFilters />
          </Suspense>
        </div>

        {/* Content */}
        <Suspense
          fallback={
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-lg h-72 animate-pulse" />
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
