import { BookOpenIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export interface BookmarkCardProps {
  comicId: number;
  comicSlug: string;
  comicTitle: string;
  coverImage: null | string;
  lastReadChapter?: {
    chapterNumber: null | number;
    id: number;
    title: null | string;
  } | null;
  onRemove?: (comicId: number) => void;
  rating: null | string;
  removing?: boolean;
  status: null | string;
  views: null | number;
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
    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/comics/${comicSlug}`}>
        <div className="relative h-48 w-full">
          <Image
            alt={`Cover of ${comicTitle}`}
            className="object-cover"
            fill
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={imgSrc}
          />
          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <Badge variant={status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"}>
              {status ?? "Unknown"}
            </Badge>
          </div>
        </div>
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link className="flex-1" href={`/comics/${comicSlug}`}>
            <CardTitle className="hover:text-primary line-clamp-2 transition-colors">{comicTitle}</CardTitle>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Last read progress */}
        {lastReadChapter && (
          <Link
            className="text-primary flex items-center gap-2 text-sm hover:underline"
            href={`/comics/${comicSlug}/chapters/${lastReadChapter.chapterNumber}`}
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>
              Continue: Ch. {lastReadChapter.chapterNumber}
              {lastReadChapter.title && ` - ${lastReadChapter.title}`}
            </span>
          </Link>
        )}

        {/* Stats */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>👁️ {(views ?? 0).toLocaleString()} views</span>
          <span>⭐ {rating ?? "N/A"}</span>
        </div>

        {/* Remove button */}
        {onRemove && (
          <Button
            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
            disabled={removing}
            onClick={(e) => {
              e.preventDefault();
              onRemove(comicId);
            }}
            size="sm"
            variant="ghost"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            {removing ? "Removing..." : "Remove Bookmark"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
