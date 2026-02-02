import { BookOpenIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { type BookmarkCardProps } from "./bookmark-card";

("use client");

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
    <div className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-colors">
      {/* Cover thumbnail */}
      <Link className="shrink-0" href={`/comics/${comicSlug}`}>
        <div className="relative h-20 w-14 overflow-hidden rounded">
          <Image
            alt={`Cover of ${comicTitle}`}
            className="object-cover"
            fill
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
            sizes="56px"
            src={imgSrc}
          />
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start gap-2">
          <Link className="hover:text-primary truncate font-medium transition-colors" href={`/comics/${comicSlug}`}>
            {comicTitle}
          </Link>
          <Badge
            className="shrink-0"
            variant={status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"}
          >
            {status ?? "Unknown"}
          </Badge>
        </div>

        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span>👁️ {(views ?? 0).toLocaleString()}</span>
          <span>⭐ {rating ? parseFloat(rating).toFixed(1) : "N/A"}</span>
        </div>

        {lastReadChapter && (
          <Link
            className="text-primary mt-1 flex items-center gap-1 text-sm hover:underline"
            href={`/comics/${comicSlug}/chapters/${lastReadChapter.chapterNumber}`}
          >
            <BookOpenIcon className="h-3 w-3" />
            Continue: Ch. {lastReadChapter.chapterNumber}
          </Link>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <Button
          aria-label="Remove bookmark"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          disabled={removing}
          onClick={() => onRemove(comicId)}
          size="icon"
          variant="ghost"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
