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
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata = {
  title: "Search Results | ComicWise",
  description: "Search for your favorite comics",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
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
  query: string;
  page: number;
  limit: number;
  status?: string;
  sort: string;
  order: "asc" | "desc";
}) {
  const result = await searchComics(query, { page, limit, sort, order });

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading search results</p>
      </div>
    );
  }

  const comics = result.data;

  // Filter by status if provided
  const filteredComics = status ? comics.filter((c) => c.status === status) : comics;

  if (filteredComics.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No comics found</h3>
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
      <p className="text-sm text-muted-foreground mb-6">
        Found {filteredComics.length} comics matching &quot;{query}&quot;
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredComics.map((comic) => (
          <ComicCard
            key={comic.id}
            id={comic.id}
            title={comic.title}
            slug={comic.slug}
            coverImage={comic.coverImage ?? ""}
            description={comic.description ?? ""}
            status={comic.status ?? "Unknown"}
            views={comic.views ?? 0}
            rating={Number(comic.rating) ?? 0}
          />
        ))}
      </div>

      {/* Pagination */}
      {filteredComics.length >= limit && (
        <div className="flex justify-center gap-2 mt-8">
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
        <div className="flex items-center gap-2 mb-4">
          <SearchIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Search Results</h1>
        </div>

        {/* Search Info */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-muted-foreground">Results for:</span>
          <Badge variant="secondary" className="text-base">
            {q}
          </Badge>
          {status && (
            <Badge variant="outline">
              {status}
              <Link href={`/search?q=${q}&page=1`} className="ml-1">
                <XIcon className="h-3 w-3" />
              </Link>
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Status Filter */}
        <Select defaultValue={status || ""}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                <Link href={`/search?q=${q}&status=${s}&page=1`} className="block w-full">
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
                <Link href={`/search?q=${q}&sort=${option.value}&page=1`} className="block w-full">
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
          query={q}
          page={page}
          limit={limit}
          status={status}
          sort={sort}
          order={order}
        />
      </Suspense>
    </main>
  );
}
