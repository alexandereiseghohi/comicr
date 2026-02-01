"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BookmarkCardProps } from "./bookmark-card";

export function BookmarkListItem({
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
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Cover thumbnail */}
      <Link href={`/comics/${comicSlug}`} className="shrink-0">
        <div className="relative h-20 w-14 overflow-hidden rounded">
          <Image
            src={imgSrc}
            alt={`Cover of ${comicTitle}`}
            fill
            className="object-cover"
            sizes="56px"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <Link
            href={`/comics/${comicSlug}`}
            className="font-medium truncate hover:text-primary transition-colors"
          >
            {comicTitle}
          </Link>
          <Badge
            variant={
              status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"
            }
            className="shrink-0"
          >
            {status ?? "Unknown"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>👁️ {(views ?? 0).toLocaleString()}</span>
          <span>⭐ {rating ? parseFloat(rating).toFixed(1) : "N/A"}</span>
        </div>

        {lastReadChapter && (
          <Link
            href={`/comics/${comicSlug}/chapters/${lastReadChapter.chapterNumber}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
          >
            <BookOpenIcon className="h-3 w-3" />
            Continue: Ch. {lastReadChapter.chapterNumber}
          </Link>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(comicId)}
          disabled={removing}
          aria-label="Remove bookmark"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
