"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ComicCardProps {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  status: string;
  views: number;
  rating: number;
  authorName?: string;
}

export function ComicCard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  title,
  slug,
  coverImage,
  description,
  status,
  views,
  rating,
  authorName,
}: ComicCardProps) {
  const fallback = "/images/placeholder-comic.jpg";
  const imgSrc = coverImage && coverImage.trim() ? coverImage : fallback;
  const altText = title ? `Cover of ${title}` : "Comic cover";
  return (
    <Link href={`/comics/${slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-48 w-full">
          <Image
            src={imgSrc}
            alt={altText}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
          />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2">{title}</CardTitle>
              {authorName && <CardDescription>{authorName}</CardDescription>}
            </div>
            <Badge
              variant={
                status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"
              }
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>👁️ {views.toLocaleString()} views</span>
            <span>⭐ {rating.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
