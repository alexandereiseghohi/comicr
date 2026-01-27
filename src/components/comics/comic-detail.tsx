import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface ComicDetailProps {
  comic: {
    id: number;
    title: string;
    slug: string;
    coverImage: string;
    description: string;
    authors?: { name: string }[];
    artists?: { name: string }[];
    genres?: { name: string }[];
    chaptersCount?: number;
    status?: string;
    rating?: number;
  };
  chapters?: { id: number; title: string; number?: number; slug?: string }[];
  isAdmin?: boolean;
}

export function ComicDetail({ comic, chapters = [], isAdmin = false }: ComicDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="md:flex gap-6 p-4 items-start">
          <div className="relative h-64 w-full md:w-56 flex-shrink-0">
            <Image src={comic.coverImage} alt={comic.title} fill className="object-cover" />
          </div>

          <CardContent>
            <CardHeader>
              <CardTitle className="text-2xl">{comic.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
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
              key={c.id}
              className="flex items-center justify-between p-3 rounded-md bg-slate-50"
            >
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-slate-500">Chapter {c.number ?? "-"}</div>
              </div>
              <Link
                href={`/comics/${comic.slug}/chapter/${c.slug ?? c.id}`}
                className="text-sm text-blue-600"
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
