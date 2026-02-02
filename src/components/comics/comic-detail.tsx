import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComicDetailProps {
  chapters?: { id: number; number?: number; slug?: string; title: string; }[];
  comic: {
    artists?: { name: string }[];
    authors?: { name: string }[];
    chaptersCount?: number;
    coverImage: string;
    description: string;
    genres?: { name: string }[];
    id: number;
    rating?: number;
    slug: string;
    status?: string;
    title: string;
  };
  isAdmin?: boolean;
}

export function ComicDetail({ comic, chapters = [], isAdmin = false }: ComicDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="items-start gap-6 p-4 md:flex">
          <div className="relative h-64 w-full flex-shrink-0 md:w-56">
            <Image alt={comic.title} className="object-cover" fill src={comic.coverImage} />
          </div>

          <CardContent>
            <CardHeader>
              <CardTitle className="text-2xl">{comic.title}</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                {comic.status && <Badge>{comic.status}</Badge>}
                {typeof comic.rating === "number" && (
                  <span className="text-sm text-slate-600">⭐ {comic.rating.toFixed(1)}</span>
                )}
              </div>
            </CardHeader>

            <p className="mt-4 text-sm text-slate-700">{comic.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {comic.authors?.map((a) => (
                <Badge key={a.name} variant="outline">
                  {a.name}
                </Badge>
              ))}

              {comic.artists?.map((a) => (
                <Badge key={a.name} variant="secondary">
                  {a.name}
                </Badge>
              ))}

              {comic.genres?.map((g) => (
                <Badge key={g.name} variant="default">
                  {g.name}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link href={`/comics/${comic.slug}`}>
                <Button variant="ghost">View Comic</Button>
              </Link>

              {isAdmin && (
                <Link href={`/comics/${comic.slug}/edit`}>
                  <Button>Edit</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      <section>
        <h3 className="text-lg font-semibold">
          Chapters ({(chapters.length ?? comic.chaptersCount) || 0})
        </h3>
        <div className="mt-3 space-y-2">
          {chapters.length === 0 && <p className="text-sm text-slate-500">No chapters yet.</p>}
          {chapters.map((c) => (
            <div
              className="flex items-center justify-between rounded-md bg-slate-50 p-3"
              key={c.id}
            >
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-slate-500">Chapter {c.number ?? "-"}</div>
              </div>
              <Link
                className="text-sm text-blue-600"
                href={`/comics/${comic.slug}/chapter/${c.slug ?? c.id}`}
              >
                Read
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
