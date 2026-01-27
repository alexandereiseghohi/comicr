import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import * as comicQueries from "@/database/queries/comic-queries";
import * as chapterQueries from "@/database/queries/chapter-queries";

export const revalidate = 3600; // Revalidate every hour

async function getComicData(slug: string) {
  const result = await comicQueries.getComicBySlug(slug);
  if (!result.success || !result.data) {
    notFound();
  }
  return result.data;
}

async function getChapters(comicId: number) {
  const result = await chapterQueries.getChaptersByComicId(comicId, { limit: 100 });
  return result.success ? result.data || [] : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comic = await getComicData(slug);

  return {
    title: `${comic.title} | ComicWise`,
    description: comic.description,
    openGraph: {
      title: comic.title,
      description: comic.description,
      images: [{ url: comic.coverImage }],
    },
  };
}

export default async function ComicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comic = await getComicData(slug);
  const chapters = await getChapters(comic.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/comics">
            <Button variant="outline" className="gap-2">
              ← Back to Comics
            </Button>
          </Link>
        </div>

        {/* Comic Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={comic.coverImage}
                alt={comic.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Comic Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-950 mb-2">{comic.title}</h1>
              {comic.authorId && (
                <p className="text-lg text-slate-600">by Author #{comic.authorId}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{comic.status}</Badge>
              {comic.typeId && <Badge variant="secondary">Type #{comic.typeId}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Views</p>
                <p className="text-2xl font-bold text-slate-950">{comic.views.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Rating</p>
                <p className="text-2xl font-bold text-slate-950">
                  ⭐ {Number(comic.rating || 0).toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-2">Description</p>
              <p className="text-slate-700 leading-relaxed">{comic.description}</p>
            </div>

            {chapters.length > 0 && (
              <Link href={`/comics/${slug}/chapters/${(chapters[0] as any).chapterNumber}`}>
                <Button size="lg" className="w-full">
                  Start Reading
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 mb-6">Chapters</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {chapters
                    .slice()
                    .reverse()
                    .map((chapter: any) => (
                      <Link
                        key={chapter.id}
                        href={`/comics/${slug}/chapters/${chapter.chapterNumber}`}
                      >
                        <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-slate-950">
                              Ch. {chapter.chapterNumber}: {chapter.title}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {new Date(chapter.releaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-slate-500">
                            👁️ {chapter.views.toLocaleString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No chapters available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
