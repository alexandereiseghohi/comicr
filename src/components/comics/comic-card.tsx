import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

("use client");

interface ComicCardProps {
  authorName?: string;
  coverImage: string;
  description: string;
  id: number;
  rating: number;
  slug: string;
  status: string;
  title: string;
  views: number;
}

export function ComicCard({
  id: _,
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
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-48 w-full">
          <Image
            alt={altText}
            className="object-cover"
            fill
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallback;
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={imgSrc}
          />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2">{title}</CardTitle>
              {authorName && <CardDescription>{authorName}</CardDescription>}
            </div>
            <Badge variant={status === "Ongoing" ? "default" : status === "Completed" ? "secondary" : "outline"}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>👁️ {views.toLocaleString()} views</span>
            <span>⭐ {rating.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
