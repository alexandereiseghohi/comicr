"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface BookmarkCardProps {
  comicId: number;
  comicTitle: string;
  comicSlug: string;
  coverImage: string | null;
  status: string | null;
  rating: string | null;
  views: number | null;
  lastReadChapter?: {
    id: number;
    chapterNumber: number | null;
    title: string | null;
  } | null;
  onRemove?: (comicId: number) => void;
  removing?: boolean;
}

export function BookmarkCard({
  comicId,
  comicTitle,
  comicSlug,
  coverImage,
  status,
  rating,
  views,
  lastReadChapter,
  onRemove,
  removing,
}: BookmarkCardProps) {
  const fallback = "/images/placeholder-comic.jpg";
  const imgSrc = coverImage && coverImage.trim() ? coverImage : fallback;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
      <Link href={`/comics/${comicSlug}`}>
        <div className="relative h-48 w-full">
          <Image
            src={imgSrc}
            alt={`Cover of ${comicTitle}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
          />
          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={
                status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"
              }
            >
              {status ?? "Unknown"}
            </Badge>
          </div>
        </div>
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/comics/${comicSlug}`} className="flex-1">
            <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
              {comicTitle}
            </CardTitle>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Last read progress */}
        {lastReadChapter && (
          <Link
            href={`/comics/${comicSlug}/chapters/${lastReadChapter.chapterNumber}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>
              Continue: Ch. {lastReadChapter.chapterNumber}
              {lastReadChapter.title && ` - ${lastReadChapter.title}`}
            </span>
          </Link>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>👁️ {(views ?? 0).toLocaleString()} views</span>
          <span>⭐ {rating ?? "N/A"}</span>
        </div>

        {/* Remove button */}
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              onRemove(comicId);
            }}
            disabled={removing}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {removing ? "Removing..." : "Remove Bookmark"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
