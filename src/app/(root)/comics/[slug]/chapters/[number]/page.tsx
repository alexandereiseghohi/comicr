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

  const chapter = (result.data || []).find((c: any) => c.chapterNumber === chapterNumber);
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
  const comicRow =
    comicResult && (comicResult as any).comic ? (comicResult as any).comic : (comicResult as any);

  return {
    title: `${comicRow.title} - Chapter ${number} | ComicWise`,
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
  const comic =
    comicResult && (comicResult as any).comic ? (comicResult as any).comic : (comicResult as any);
  const author = comicResult && (comicResult as any).author ? (comicResult as any).author : null;

  // Get chapter
  const chapter = await getChapterData(comic.id, chapterNumber);

  // Get all chapters for navigation
  const allChapters = (await getAllChaptersForNavigation(comic.id)).sort(
    (a: any, b: any) => a.chapterNumber - b.chapterNumber
  );

  const currentIndex = allChapters.findIndex((c: any) => c.chapterNumber === chapterNumber);
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
              {allChapters.map((ch: any) => (
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
