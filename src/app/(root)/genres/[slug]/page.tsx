import { ArrowLeft, BookOpen } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ComicList } from "@/components/comics/comic-list";
import { ComicPagination } from "@/components/comics/comic-pagination";
import { GenreGrid } from "@/components/comics/genre-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as comicQueries from "@/database/queries/comic-queries";
import * as genreQueries from "@/database/queries/genre.queries";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    limit?: string;
    order?: "asc" | "desc";
    page?: string;
    sort?: string;
  }>;
}

async function GenreComicsContent({
  slug,
  searchParams,
}: {
  searchParams: {
    limit?: string;
    order?: "asc" | "desc";
    page?: string;
    sort?: string;
  };
  slug: string;
}) {
  const page = parseInt(searchParams.page ?? "1");
  const limit = parseInt(searchParams.limit ?? "20");
  const sort = searchParams.sort || "createdAt";
  const order = searchParams.order === "asc" ? "asc" : "desc";

  const result = await comicQueries.getComicsByGenres([slug], { page, limit, sort, order });

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

  if (comics.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <BookOpen className="mb-4 h-16 w-16 text-slate-300" />
        <h3 className="mb-2 text-lg font-semibold text-slate-900">No comics found</h3>
        <p className="mb-6 text-sm text-slate-600">
          There are no comics in this genre yet. Check back later!
        </p>
        <Link href="/comics">
          <Button>Browse All Comics</Button>
        </Link>
      </div>
    );
  }

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

async function RelatedGenres({ currentSlug }: { currentSlug: string }) {
  const genresResult = await genreQueries.getGenresWithComicCount(6);

  if (!genresResult.success || !genresResult.data) {
    return null;
  }

  // Filter out current genre and limit to 4
  const relatedGenres = genresResult.data.filter((g) => g.slug !== currentSlug).slice(0, 4);

  if (relatedGenres.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Genres</CardTitle>
        <CardDescription>Explore similar genres you might enjoy</CardDescription>
      </CardHeader>
      <CardContent>
        <GenreGrid className="grid-cols-1 gap-3 sm:grid-cols-2" genres={relatedGenres} />
      </CardContent>
    </Card>
  );
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Fetch genre details
  const genreResult = await genreQueries.getGenreBySlug(slug);

  if (!genreResult.success || !genreResult.data) {
    notFound();
  }

  const genre = genreResult.data;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/comics">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Comics
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Genre Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-4xl font-bold text-slate-950">{genre.name}</h1>
              {genre.description && <p className="text-lg text-slate-600">{genre.description}</p>}
            </div>

            {/* Comics Content */}
            <Suspense
              fallback={
                <div className="space-y-8">
                  <div className="h-12 animate-pulse rounded bg-slate-100" />
                  <div className="grid grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div className="h-72 animate-pulse rounded-lg bg-slate-200" key={i} />
                    ))}
                  </div>
                  <div className="h-12 animate-pulse rounded bg-slate-100" />
                </div>
              }
            >
              <GenreComicsContent searchParams={searchParamsResolved} slug={slug} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense
              fallback={
                <Card>
                  <CardHeader>
                    <div className="mb-2 h-6 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div className="h-24 animate-pulse rounded bg-slate-100" key={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <RelatedGenres currentSlug={slug} />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const genreResult = await genreQueries.getGenreBySlug(slug);

  if (!genreResult.success || !genreResult.data) {
    return {
      title: "Genre Not Found | ComicWise",
    };
  }

  const genre = genreResult.data;

  return {
    title: `${genre.name} Comics | ComicWise`,
    description: genre.description || `Browse and read ${genre.name} comics on ComicWise`,
  };
}
