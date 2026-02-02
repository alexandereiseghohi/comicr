import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComicCard } from "@/components/comics/comic-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { searchComics } from "@/database/queries/comic-queries";
import { SearchParamsSchema } from "@/schemas/search.schema";

export const metadata = {
  title: "Search Results | ComicWise",
  description: "Search for your favorite comics",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div className="space-y-3" key={i}>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

async function SearchResults({
  query,
  page,
  limit,
  status,
  sort,
  order,
}: {
  limit: number;
  order: "asc" | "desc";
  page: number;
  query: string;
  sort: string;
  status?: string;
}) {
  const result = await searchComics(query, { page, limit, sort, order });

  if (!result.success || !result.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Error loading search results</p>
      </div>
    );
  }

  const comics = result.data;

  // Filter by status if provided
  const filteredComics = status ? comics.filter((c) => c.status === status) : comics;

  if (filteredComics.length === 0) {
    return (
      <div className="py-12 text-center">
        <SearchIcon className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">No comics found</h3>
        <p className="text-muted-foreground mb-4">
          No results for &quot;{query}&quot;
          {status && ` with status "${status}"`}
        </p>
        <Link href="/comics">
          <Button variant="outline">Browse all comics</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-6 text-sm">
        Found {filteredComics.length} comics matching &quot;{query}&quot;
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredComics.map((comic) => (
          <ComicCard
            coverImage={comic.coverImage ?? ""}
            description={comic.description ?? ""}
            id={comic.id}
            key={comic.id}
            rating={Number(comic.rating) || 0}
            slug={comic.slug}
            status={comic.status ?? "Unknown"}
            title={comic.title}
            views={comic.views ?? 0}
          />
        ))}
      </div>

      {/* Pagination */}
      {filteredComics.length >= limit && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/search?q=${query}&page=${page - 1}&limit=${limit}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <Link href={`/search?q=${query}&page=${page + 1}&limit=${limit}`}>
            <Button variant="outline">Next</Button>
          </Link>
        </div>
      )}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Parse and validate search params
  const parsed = SearchParamsSchema.safeParse({
    q: params.q,
    page: params.page || "1",
    limit: params.limit || "20",
    status: params.status,
    sort: params.sort || "relevance",
    order: params.order || "desc",
  });

  if (!parsed.success || !parsed.data.q) {
    notFound();
  }

  const { q, page, limit, status, sort, order } = parsed.data;

  const statuses = ["Ongoing", "Completed", "Hiatus", "Dropped", "Season End", "Coming Soon"];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Top Rated" },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <SearchIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Search Results</h1>
        </div>

        {/* Search Info */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Results for:</span>
          <Badge className="text-base" variant="secondary">
            {q}
          </Badge>
          {status && (
            <Badge variant="outline">
              {status}
              <Link className="ml-1" href={`/search?q=${q}&page=1`}>
                <XIcon className="h-3 w-3" />
              </Link>
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Status Filter */}
        <Select defaultValue={status || ""}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                <Link className="block w-full" href={`/search?q=${q}&status=${s}&page=1`}>
                  {s}
                </Link>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select defaultValue={sort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <Link className="block w-full" href={`/search?q=${q}&sort=${option.value}&page=1`}>
                  {option.label}
                </Link>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults
          limit={limit}
          order={order}
          page={page}
          query={q}
          sort={sort}
          status={status}
        />
      </Suspense>
    </main>
  );
}
