import { BookmarkIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { BookmarkList, BookmarkListSkeleton } from "@/components/bookmarks/bookmark-list";
import { getBookmarksWithComics } from "@/database/queries/bookmark.queries";
import { auth } from "@/lib/auth-config";

export const metadata = {
  title: "Your Bookmarks | ComicWise",
  description: "Manage your bookmarked comics",
};

async function BookmarksContent({ userId }: { userId: string }) {
  const result = await getBookmarksWithComics(userId);

  if (!result.success || !result.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load bookmarks</p>
      </div>
    );
  }

  return <BookmarkList initialBookmarks={result.data} userId={userId} />;
}

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/bookmarks");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <BookmarkIcon className="h-7 w-7" />
        <h1 className="text-2xl font-bold">Your Bookmarks</h1>
      </div>

      {/* Content */}
      <Suspense fallback={<BookmarkListSkeleton />}>
        <BookmarksContent userId={session.user.id} />
      </Suspense>
    </main>
  );
}
