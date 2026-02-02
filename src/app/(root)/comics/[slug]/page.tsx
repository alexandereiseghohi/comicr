import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import BookmarkButton from "@/components/bookmarks/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isBookmarked } from "@/database/mutations/bookmark-mutations";
import * as chapterQueries from "@/database/queries/chapter-queries";
import * as comicQueries from "@/database/queries/comic-queries";

export const revalidate = 3600; // Revalidate every hour

async function getComicData(slug: string) {
  const result = await comicQueries.getComicBySlug(slug);
  if (!result.success || !result.data) {
    notFound();
  }
  return result.data;
}

async function getChapters(comicId: number) {
  const result = await chapterQueries.getChaptersByComicId(comicId, {
    limit: 100,
  });
  return result.success ? result.data || [] : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const comicResult = await getComicData(slug);
  function hasComicField(obj: unknown): obj is { comic: Record<string, unknown> } {
    return typeof obj === "object" && obj !== null && "comic" in obj;
  }

  const comic = hasComicField(comicResult) ? comicResult.comic : comicResult;

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
  const comicResult = await getComicData(slug);
  // Support both legacy row shape and joined shape { comic, author, artist }
  function hasComicField(obj: unknown): obj is { comic: Record<string, unknown> } {
    return typeof obj === "object" && obj !== null && "comic" in obj;
  }

  const comic = hasComicField(comicResult) ? comicResult.comic : comicResult;
  const author = hasComicField(comicResult) && comicResult.author ? comicResult.author : null;
  const chapters = await getChapters(comic.id);

  // Determine bookmark state for current user (server-side)
  let initialBookmarked = false;
  let session = null as { user?: { id?: string } } | null;
  try {
    session = await auth();
    if (session?.user?.id) {
      initialBookmarked = await isBookmarked(session.user.id, comic.id);
    }
  } catch {
    // ignore auth errors and treat as not bookmarked
    initialBookmarked = false;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/comics">
            <Button className="gap-2" variant="outline">
              ← Back to Comics
            </Button>
          </Link>
        </div>

        {/* Comic Header */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-lg">
              <Image
                alt={comic.title}
                className="object-cover"
                fill
                priority
                src={comic.coverImage}
              />
            </div>
          </div>

          {/* Comic Info */}
          <div className="space-y-6 md:col-span-2">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-950">{comic.title}</h1>
              {author?.name ? (
                <p className="text-lg text-slate-600">by {author.name}</p>
              ) : comic.authorId ? (
                <p className="text-lg text-slate-600">by Author #{comic.authorId}</p>
              ) : (
                <p className="text-lg text-slate-600">by Unknown Author</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>{comic.status}</Badge>
              {comic.typeId && <Badge variant="secondary">Type #{comic.typeId}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Views</p>
                <p className="text-2xl font-bold text-slate-950">{comic.views.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Rating</p>
                <p className="text-2xl font-bold text-slate-950">
                  ⭐ {Number(comic.rating || 0).toFixed(1)}
                </p>
              </div>
            </div>

            <div>
              {/* Bookmark button (client) - shown for authenticated users; initial state set server-side */}
              {session?.user?.id ? (
                <BookmarkButton
                  comicId={Number(comic.id)}
                  initialBookmarked={initialBookmarked}
                  userId={String(session.user?.id)}
                />
              ) : null}
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-600">Description</p>
              <p className="leading-relaxed text-slate-700">{comic.description}</p>
            </div>

            {chapters.length > 0 && (
              <Link
                href={`/comics/${slug}/chapters/${
                  (chapters[0] as { chapterNumber?: number })?.chapterNumber ?? 1
                }`}
              >
                <Button className="w-full" size="lg">
                  Start Reading
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length > 0 && (
          <div className="space-y-4">
            <h2 className="mb-6 text-2xl font-bold text-slate-950">Chapters</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {chapters
                    .slice()
                    .reverse()
                    .map(
                      (chapter: {
                        chapterNumber: number;
                        id: number;
                        releaseDate: Date | string;
                        title: string;
                        views: number;
                      }) => (
                        <Link
                          href={`/comics/${slug}/chapters/${chapter.chapterNumber}`}
                          key={chapter.id}
                        >
                          <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
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
                      )
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {chapters.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-600">No chapters available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
