import { Layers } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { GenreGrid } from "@/components/comics/genre-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as genreQueries from "@/database/queries/genre.queries";

export const metadata: Metadata = {
  title: "Browse Genres | ComicWise",
  description: "Explore all comic genres available on ComicWise. Find action, romance, fantasy, sci-fi, and more.",
};

async function AllGenresContent() {
  // Get all genres with comic counts - use a high limit to get all
  const result = await genreQueries.getGenresWithComicCount(100);

  if (!result.success || !result.data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <Layers className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900">Error loading genres</h3>
          <p className="mt-2 text-sm text-slate-600">{result.error || "Please try again later."}</p>
        </div>
      </div>
    );
  }

  const genres = result.data;

  if (genres.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center">
        <Layers className="mb-4 h-12 w-12 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-900">No genres available</h3>
        <p className="mt-2 text-sm text-slate-600">Check back soon for new content!</p>
      </div>
    );
  }

  // Calculate total comics across all genres
  const totalComics = genres.reduce((sum, g) => sum + (g.comicCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Stats Summary */}
      <div className="flex flex-wrap gap-4">
        <Badge className="px-4 py-2 text-sm" variant="secondary">
          {genres.length} Genres
        </Badge>
        <Badge className="px-4 py-2 text-sm" variant="outline">
          {totalComics.toLocaleString()} Total Comics
        </Badge>
      </div>

      {/* Genre Grid - Featured (Top 8 by comic count) */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Popular Genres</h2>
        <GenreGrid className="grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" genres={genres.slice(0, 8)} />
      </section>

      {/* All Genres List */}
      {genres.length > 8 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">All Genres</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {genres.map((genre) => (
              <Link
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={`/genres/${genre.slug}`}
                key={genre.id}
              >
                <span className="font-medium text-slate-900 group-hover:text-slate-700">{genre.name}</span>
                <Badge className="text-xs" variant="secondary">
                  {genre.comicCount || 0}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function GenresIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-950">Browse Genres</h1>
          <p className="text-lg text-slate-600">Discover comics by genre. Find your next favorite read!</p>
        </div>

        {/* Browse by Category Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Comic Categories
            </CardTitle>
            <CardDescription>
              Explore our collection organized by genre. Each genre shows the number of available comics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
                    <div className="h-8 w-32 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div className="h-24 animate-pulse rounded-lg bg-slate-100" key={i} />
                    ))}
                  </div>
                </div>
              }
            >
              <AllGenresContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
