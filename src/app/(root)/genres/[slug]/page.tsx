import { ComicList } from "@/components/comics/comic-list";
import { ComicPagination } from "@/components/comics/comic-pagination";
import { GenreGrid } from "@/components/comics/genre-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as comicQueries from "@/database/queries/comic-queries";
import * as genreQueries from "@/database/queries/genre.queries";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    order?: "asc" | "desc";
  }>;
}

async function GenreComicsContent({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    order?: "asc" | "desc";
  };
}) {
  const page = parseInt(searchParams.page ?? "1");
  const limit = parseInt(searchParams.limit ?? "20");
  const sort = searchParams.sort || "createdAt";
  const order = searchParams.order === "asc" ? "asc" : "desc";

  const result = await comicQueries.getComicsByGenres([slug], { page, limit, sort, order });

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

  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No comics found</h3>
        <p className="text-sm text-slate-600 mb-6">
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
      <ComicPagination currentPage={page} totalItems={total} itemsPerPage={limit} />

      {/* Comic List */}
      <ComicList comics={comics} />

      {/* Pagination - Bottom */}
      <ComicPagination currentPage={page} totalItems={total} itemsPerPage={limit} />
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
        <GenreGrid genres={relatedGenres} className="grid-cols-1 sm:grid-cols-2 gap-3" />
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
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Comics
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Genre Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-950 mb-2">{genre.name}</h1>
              {genre.description && <p className="text-lg text-slate-600">{genre.description}</p>}
            </div>

            {/* Comics Content */}
            <Suspense
              fallback={
                <div className="space-y-8">
                  <div className="h-12 bg-slate-100 rounded animate-pulse" />
                  <div className="grid grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-slate-200 rounded-lg h-72 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-12 bg-slate-100 rounded animate-pulse" />
                </div>
              }
            >
              <GenreComicsContent slug={slug} searchParams={searchParamsResolved} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense
              fallback={
                <Card>
                  <CardHeader>
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
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
