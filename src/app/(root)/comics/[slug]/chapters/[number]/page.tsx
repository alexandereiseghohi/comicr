/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as chapterQueries from "@/database/queries/chapter-queries";
import * as comicQueries from "@/database/queries/comic-queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

async function getChapterData(comicId: number, chapterNumber: number) {
  const result = await chapterQueries.getChaptersByComicId(comicId, { limit: 100 });
  if (!result.success) notFound();

  const chapter = (result.data || []).find(
    (c: { chapterNumber: number }) => c.chapterNumber === chapterNumber
  );
  if (!chapter) notFound();

  return chapter;
}

async function getAllChaptersForNavigation(comicId: number) {
  const result = await chapterQueries.getChaptersByComicId(comicId, { limit: 100 });
  return (result.success ? result.data : []) || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const { slug, number } = await params;
  const comicResult = await comicQueries.getComicBySlug(slug);
  if (!comicResult.success || !comicResult.data) return {};
  // Support both legacy and joined shape
  let title = "";
  // Try joined shape first
  if (
    (comicResult.data as any).comic &&
    typeof (comicResult.data as any).comic.title === "string"
  ) {
    title = (comicResult.data as { comic: { title: string } }).comic.title;
  } else if (typeof (comicResult.data as any).title === "string") {
    // Cast to unknown first to satisfy TypeScript
    title = (comicResult.data as unknown as { title: string }).title;
  }
  return {
    title: `${title} - Chapter ${number} | ComicWise`,
  };
}

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const { slug, number } = await params;
  const chapterNumber = parseInt(number);

  // Get comic (support both legacy row shape and joined shape { comic, author, artist })
  const comicResult = await comicQueries.getComicBySlug(slug);
  if (!comicResult.success || !comicResult.data) notFound();
  // Support both legacy and joined shape
  let comic: { id: number; title: string } | undefined = undefined;
  let author: { name?: string } | null = null;
  // Joined shape: has 'comic' property
  if (
    typeof comicResult.data === "object" &&
    comicResult.data !== null &&
    "comic" in comicResult.data &&
    comicResult.data.comic &&
    typeof comicResult.data.comic.id === "number" &&
    typeof comicResult.data.comic.title === "string"
  ) {
    comic = {
      id: comicResult.data.comic.id,
      title: comicResult.data.comic.title,
    };
    if ("author" in comicResult.data && comicResult.data.author) {
      author = comicResult.data.author;
    }
  } else if (
    typeof comicResult.data === "object" &&
    comicResult.data !== null &&
    "id" in comicResult.data &&
    typeof comicResult.data.id === "number" &&
    "title" in comicResult.data &&
    typeof comicResult.data.title === "string"
  ) {
    comic = {
      id: comicResult.data.id,
      title: comicResult.data.title,
    };
    if ("author" in comicResult.data && comicResult.data.author) {
      author = comicResult.data.author;
    }
  }

  if (!comic) notFound();

  // Get chapter
  const chapter = await getChapterData(comic.id, chapterNumber);

  // Get all chapters for navigation
  const allChapters = (await getAllChaptersForNavigation(comic.id)).sort(
    (a: { chapterNumber: number }, b: { chapterNumber: number }) =>
      a.chapterNumber - b.chapterNumber
  );

  const currentIndex = allChapters.findIndex(
    (c: { chapterNumber: number }) => c.chapterNumber === chapterNumber
  );
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/comics/${slug}`}>
              <Button variant="outline" className="gap-2 mb-4">
                ← Back to {comic.title}
              </Button>
            </Link>
            {author?.name && <p className="text-sm text-slate-400">by {author.name}</p>}
            <h1 className="text-3xl font-bold text-white">
              Ch. {chapter.chapterNumber}: {chapter.title}
            </h1>
            <p className="text-slate-400 mt-2">
              Released {new Date(chapter.releaseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white mb-8">
          <CardContent className="p-8">
            {chapter.content ? (
              <div className="prose max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{chapter.content}</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-600">Chapter content coming soon...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            {prevChapter ? (
              <Link href={`/comics/${slug}/chapters/${prevChapter.chapterNumber}`}>
                <Button variant="outline" className="w-full gap-2">
                  ← Previous
                </Button>
              </Link>
            ) : (
              <Button variant="outline" disabled className="w-full gap-2">
                ← Previous
              </Button>
            )}
          </div>

          <Link href={`/comics/${slug}`}>
            <Button variant="outline" className="w-full">
              All Chapters
            </Button>
          </Link>

          <div>
            {nextChapter ? (
              <Link href={`/comics/${slug}/chapters/${nextChapter.chapterNumber}`}>
                <Button variant="outline" className="w-full gap-2">
                  Next →
                </Button>
              </Link>
            ) : (
              <Button variant="outline" disabled className="w-full gap-2">
                Next →
              </Button>
            )}
          </div>
        </div>

        {/* Chapter List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Jump to Chapter</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
              {allChapters.map((ch: { id: number; chapterNumber: number }) => (
                <Link key={ch.id} href={`/comics/${slug}/chapters/${ch.chapterNumber}`}>
                  <Button
                    variant={ch.chapterNumber === chapterNumber ? "default" : "outline"}
                    className="w-full text-sm"
                  >
                    Ch. {ch.chapterNumber}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
