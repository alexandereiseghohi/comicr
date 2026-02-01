"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Drama, Heart, Laugh, Rocket, Sparkles, Star, Swords, Zap } from "lucide-react";
import Link from "next/link";

interface GenreWithCount {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  comicCount: number;
}

interface GenreGridProps {
  genres: GenreWithCount[];
  className?: string;
}

// Map genre names to icons
const genreIconMap: Record<string, LucideIcon> = {
  action: Swords,
  adventure: Rocket,
  comedy: Laugh,
  drama: Drama,
  fantasy: Sparkles,
  horror: Zap,
  mystery: Star,
  romance: Heart,
  "slice of life": BookOpen,
};

const getGenreIcon = (genreName: string): LucideIcon => {
  const normalized = genreName.toLowerCase();
  return genreIconMap[normalized] || BookOpen;
};

// Color scheme for each genre (rotate through colors)
const colorSchemes = [
  "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700",
  "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
  "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700",
  "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
  "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
  "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
  "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700",
  "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
];

export function GenreGrid({ genres, className }: GenreGridProps) {
  if (genres.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No genres available</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {genres.map((genre, index) => {
        const Icon = getGenreIcon(genre.name);
        const colorScheme = colorSchemes[index % colorSchemes.length];

        return (
          <Link key={genre.id} href={`/comics?genres=${genre.slug}`}>
            <Card
              className={cn(
                "transition-all duration-200 cursor-pointer border-2 h-full",
                colorScheme
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span className="text-sm font-semibold px-2 py-1 rounded-full bg-white/50">
                    {genre.comicCount}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardTitle className="text-lg leading-tight mb-1">{genre.name}</CardTitle>
                {genre.description && (
                  <CardDescription className="text-sm line-clamp-2 opacity-80">
                    {genre.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
